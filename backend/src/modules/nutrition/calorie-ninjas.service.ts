import axios from 'axios';
import { NormalizedFoodNutrition } from '../ai/ai.types';

export interface CalorieNinjasItem {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

export interface CalorieNinjasResponse {
  items: CalorieNinjasItem[];
}

export class CalorieNinjasService {
  private static readonly API_URL = 'https://api.calorieninjas.com/v1/nutrition';
  private static readonly TIMEOUT_MS = 8000;

  /**
   * Queries the Calorie Ninjas API for food items.
   * @param query Natural language query (e.g. "2 eggs and a banana")
   */
  static async queryNutrition(query: string): Promise<CalorieNinjasItem[]> {
    const apiKey = process.env.FOOD_CALORIE_API_KEY;
    
    if (!apiKey) {
      console.warn('CalorieNinjas API key is not configured');
      return [];
    }

    try {
      const response = await axios.get<CalorieNinjasResponse>(this.API_URL, {
        params: { query },
        headers: { 'X-Api-Key': apiKey },
        timeout: this.TIMEOUT_MS,
      });

      if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      
      return [];
    } catch (error: any) {
      // Safe logging, never log the API key
      const status = error.response?.status;
      console.error(`[CalorieNinjas] API Error: ${status || 'Network/Timeout'} - ${error.message}`);
      
      if (status === 401 || status === 403 || status === 400) {
        console.error('[CalorieNinjas] Auth/Validation error. Check API key.');
      } else if (status === 429) {
        console.error('[CalorieNinjas] Rate limit exceeded.');
      }
      
      return [];
    }
  }

  /**
   * Normalizes a raw CalorieNinjas item into the standard app format.
   * Validates that required macros are present.
   */
  static normalizeItem(raw: CalorieNinjasItem, originalQuery: string): NormalizedFoodNutrition {
    // Check if the item has valid macros
    const hasValidMacros = 
      raw.calories !== undefined && raw.calories !== null &&
      raw.protein_g !== undefined && raw.protein_g !== null &&
      raw.fat_total_g !== undefined && raw.fat_total_g !== null &&
      raw.carbohydrates_total_g !== undefined && raw.carbohydrates_total_g !== null;

    if (!hasValidMacros) {
      return {
        name: raw.name || originalQuery,
        quantity: 1,
        unit: 'serving',
        calories: null,
        proteinGrams: null,
        fatGrams: null,
        carbsGrams: null,
        fiberGrams: null,
        source: 'unknown',
        confidence: 'low'
      };
    }

    return {
      name: raw.name,
      quantity: 1, // CalorieNinjas already scaled the nutrition to the query quantity, so the resulting block represents "1 parsed item"
      unit: 'query_match',
      grams: raw.serving_size_g,
      calories: Math.round(raw.calories * 10) / 10,
      proteinGrams: Math.round(raw.protein_g * 10) / 10,
      fatGrams: Math.round(raw.fat_total_g * 10) / 10,
      carbsGrams: Math.round(raw.carbohydrates_total_g * 10) / 10,
      fiberGrams: raw.fiber_g ? Math.round(raw.fiber_g * 10) / 10 : 0,
      source: 'calorie-ninjas',
      confidence: 'high'
    };
  }
}
