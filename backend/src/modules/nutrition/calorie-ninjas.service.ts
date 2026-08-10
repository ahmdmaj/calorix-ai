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
   * @param query   - The food name (already stripped of quantity/unit by the caller)
   * @param requestedGrams - How many grams the user asked for (defaults to 100 if not specified)
   * @param quantitySpecified - Whether the user explicitly stated a quantity/weight
   */
  static async lookupFood(
    query: string,
    requestedGrams = 100,
    quantitySpecified = false,
  ): Promise<NormalizedFoodNutrition> {
    const apiKey = this.apiKey;

    console.log('[CalorieAPI] API key exists:', Boolean(apiKey), '| query:', query, '| requestedGrams:', requestedGrams);

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

    return this.normalizeFood(best, query, requestedGrams, quantitySpecified);
  }

  /**
   * Converts a raw search result food into NormalizedFoodNutrition.
   *
   * Strategy:
   *   - Always scale from the API's per-100g values for accuracy.
   *   - If the user specified a weight (e.g. "100g"), use that exact weight.
   *   - If no weight was given, default to 100 g so the response is always
   *     for a well-defined, consistent portion.
   */
  private static normalizeFood(
    food: CalorieApiSearchFood,
    originalQuery: string,
    requestedGrams = 100,
    quantitySpecified = false,
  ): NormalizedFoodNutrition {
    const toNum = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const round1 = (n: number) => Math.round(n * 10) / 10;

    // Prefer per-100g fields — they are always precise regardless of serving size.
    const cal100g     = toNum(food.calories_100g);
    const protein100g = toNum(food.protein_100g);
    const fat100g     = toNum(food.fat_100g);
    const carbs100g   = toNum(food.carbs_100g);
    const fiber100g   = toNum(food.fiber_100g);

    // Check if per-100g data is available
    const hasPer100g = cal100g !== null && protein100g !== null && fat100g !== null && carbs100g !== null;

    let calories: number | null;
    let protein: number | null;
    let fat: number | null;
    let carbs: number | null;
    let fiber: number | null;
    let resolvedGrams: number;
    let unitLabel: string;

    if (hasPer100g) {
      // Scale per-100g values to the requested grams
      const factor = requestedGrams / 100;
      calories = round1(cal100g! * factor);
      protein  = round1(protein100g! * factor);
      fat      = round1(fat100g! * factor);
      carbs    = round1(carbs100g! * factor);
      fiber    = fiber100g !== null ? round1(fiber100g * factor) : null;
      resolvedGrams = requestedGrams;
      unitLabel = `${requestedGrams}g`;
    } else {
      // Fallback: use meal.macros (default serving) when no per-100g data
      const meal = food.meal;
      calories = toNum(meal?.calories);
      protein  = toNum(meal?.macros?.protein);
      fat      = toNum(meal?.macros?.fat);
      carbs    = toNum(meal?.macros?.carbs);
      fiber    = toNum(meal?.macros?.fiber);
      resolvedGrams = food.serving_size ?? requestedGrams;
      unitLabel = food.serving || 'serving';
    }

    if (calories === null || protein === null || fat === null || carbs === null) {
      console.warn('[CalorieAPI] Missing macros for food:', food.name, { calories, protein, fat, carbs });
      return this.unknownFood(originalQuery, 'nutrition_fields_missing');
    }

    console.log('[CalorieAPI] Normalized:', {
      name: food.name,
      requestedGrams,
      resolvedGrams,
      quantitySpecified,
      calories,
      protein,
      fat,
      carbs,
    });

    return {
      foodId: food.id,
      name: food.name,
      quantity: resolvedGrams,
      unit: unitLabel,
      grams: resolvedGrams,
      calories,
      proteinGrams: protein,
      fatGrams: fat,
      carbsGrams: carbs,
      fiberGrams: fiber,
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
