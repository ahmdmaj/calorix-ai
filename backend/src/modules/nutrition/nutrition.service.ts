import { FoodExtractionItem } from '../ai/ai.types';

export interface NutritionItemResult {
  name: string;
  quantity: number;
  unit: string;
  calories_min: number | null;
  calories_max: number | null;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  source: string;
  warning?: string;
}

export interface NutritionLookupResult {
  total_min: number;
  total_max: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  food_items: NutritionItemResult[];
}

export const lookup = async (items: FoodExtractionItem[]): Promise<NutritionLookupResult> => {
  let total_min = 0;
  let total_max = 0;
  let total_protein_g = 0;
  let total_fat_g = 0;
  let total_carbs_g = 0;
  const food_items: NutritionItemResult[] = [];

  for (const item of items) {
    // Gemini now provides calorie estimates directly — use them
    const hasCalories = item.calories_min > 0 || item.calories_max > 0;

    if (hasCalories) {
      total_min += item.calories_min;
      total_max += item.calories_max;
      total_protein_g += item.protein_g || 0;
      total_fat_g += item.fat_g || 0;
      total_carbs_g += item.carbs_g || 0;

      food_items.push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories_min: item.calories_min,
        calories_max: item.calories_max,
        protein_g: item.protein_g,
        fat_g: item.fat_g,
        carbs_g: item.carbs_g,
        source: 'gemini_ai',
      });
    } else {
      // Edge case: Gemini couldn't estimate (very unusual)
      food_items.push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories_min: null,
        calories_max: null,
        source: 'unknown',
        warning: `Could not estimate calories for '${item.name}'.`,
      });
    }
  }

  return {
    total_min,
    total_max,
    total_protein_g,
    total_fat_g,
    total_carbs_g,
    food_items,
  };
};
