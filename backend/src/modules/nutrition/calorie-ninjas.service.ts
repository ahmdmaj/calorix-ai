import axios from 'axios';
import { NormalizedFoodNutrition } from '../ai/ai.types';

// ─── API Response Shapes ───────────────────────────────────────────────────────

interface CalorieApiSearchFood {
  id: number;
  name: string;
  serving_size: number;
  serving_unit: string;
  serving: string;
  calories_100g: number;
  protein_100g: number;
  carbs_100g: number;
  fat_100g: number;
  fiber_100g: number | null;
  is_verified: boolean;
  /** meal object is included in search results — pre-scaled to default serving */
  meal: {
    name: string;
    calories: number;
    servings: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

interface CalorieApiSearchResponse {
  data: CalorieApiSearchFood[];
  total: number;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export class CalorieApiService {
  private static readonly BASE_URL = 'https://calorieapiadmin.com/api/v1';
  private static readonly TIMEOUT_MS = 10_000;

  private static get apiKey(): string | undefined {
    return process.env.FOOD_CALORIE_API_KEY || process.env.CALORIE_API_KEY;
  }

  /**
   * Searches for a food item by name and returns normalized nutrition data.
   * Uses the meal.macros sub-object which is already scaled to the default serving size.
   */
  static async lookupFood(query: string): Promise<NormalizedFoodNutrition> {
    const apiKey = this.apiKey;

    console.log('[CalorieAPI] API key exists:', Boolean(apiKey), '| query:', query);

    if (!apiKey) {
      console.error('[CalorieAPI] FOOD_CALORIE_API_KEY is not set');
      return this.unknownFood(query, 'api_key_missing');
    }

    let searchResults: CalorieApiSearchFood[] = [];

    try {
      const searchUrl = `${this.BASE_URL}/search/foods`;
      console.log('[CalorieAPI] Search URL:', searchUrl, '| q:', query);

      const response = await axios.get<CalorieApiSearchResponse>(searchUrl, {
        params: { q: query },
        headers: { 'X-Api-Key': apiKey },
        timeout: this.TIMEOUT_MS,
      });

      console.log('[CalorieAPI] Search status:', response.status);
      console.log('[CalorieAPI] Total results:', response.data?.total);

      const payload = response.data;

      // Safely extract array from possible response shapes
      if (Array.isArray(payload)) {
        searchResults = payload;
      } else if (Array.isArray(payload?.data)) {
        searchResults = payload.data;
      } else {
        console.error('[CalorieAPI] Unexpected response shape:', JSON.stringify(payload).slice(0, 200));
        return this.unknownFood(query, 'invalid_response_shape');
      }
    } catch (error: any) {
      const status = error.response?.status;
      console.error('[CalorieAPI] Search error:', {
        status,
        data: error.response?.data,
        message: error.message,
      });

      if (status === 401 || status === 403) return this.unknownFood(query, 'api_unauthorized');
      if (status === 429) return this.unknownFood(query, 'api_rate_limited');
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return this.unknownFood(query, 'request_timeout');
      return this.unknownFood(query, 'no_search_results');
    }

    if (searchResults.length === 0) {
      console.warn('[CalorieAPI] No results for query:', query);
      return this.unknownFood(query, 'no_search_results');
    }

    // Pick best result: prefer verified foods
    const best = searchResults.find((f) => f.is_verified) ?? searchResults[0];
    console.log('[CalorieAPI] Best match:', best.name, '| id:', best.id);

    return this.normalizeFood(best, query);
  }

  /**
   * Converts a raw search result food into NormalizedFoodNutrition.
   * Prefers `meal.macros` (pre-scaled to default serving) over per-100g values.
   */
  private static normalizeFood(food: CalorieApiSearchFood, originalQuery: string): NormalizedFoodNutrition {
    const meal = food.meal;

    const toNum = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    // Use meal.macros which are already scaled to the default serving size
    const calories = toNum(meal?.calories);
    const protein  = toNum(meal?.macros?.protein);
    const fat      = toNum(meal?.macros?.fat);
    const carbs    = toNum(meal?.macros?.carbs);
    const fiber    = toNum(meal?.macros?.fiber);

    if (calories === null || protein === null || fat === null || carbs === null) {
      console.warn('[CalorieAPI] Missing macros for food:', food.name, { calories, protein, fat, carbs });
      return this.unknownFood(originalQuery, 'nutrition_fields_missing');
    }

    const round1 = (n: number) => Math.round(n * 10) / 10;

    console.log('[CalorieAPI] Normalized:', {
      name: food.name,
      calories: round1(calories),
      protein: round1(protein),
      fat: round1(fat),
      carbs: round1(carbs),
    });

    return {
      foodId: food.id,
      name: food.name,
      quantity: 1,
      unit: food.serving || 'serving',
      grams: food.serving_size,
      calories: round1(calories),
      proteinGrams: round1(protein),
      fatGrams: round1(fat),
      carbsGrams: round1(carbs),
      fiberGrams: fiber !== null ? round1(fiber) : null,
      source: 'calorie-api',
      confidence: food.is_verified ? 'high' : 'medium',
      verified: food.is_verified,
    };
  }

  /** Returns a structured "unknown food" result with a specific failure reason. */
  private static unknownFood(query: string, reason: string): NormalizedFoodNutrition {
    return {
      name: query,
      quantity: 1,
      unit: 'serving',
      calories: null,
      proteinGrams: null,
      fatGrams: null,
      carbsGrams: null,
      fiberGrams: null,
      source: 'unknown',
      confidence: 'low',
      failureReason: reason,
    } as NormalizedFoodNutrition & { failureReason: string };
  }
}
