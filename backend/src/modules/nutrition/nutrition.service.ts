import localFoods from './local-foods.json';
import { FoodExtractionItem } from '../ai/ai.types';

export interface NutritionItemResult {
  name: string;
  calories_min: number | null;
  calories_max: number | null;
  source: string;
  warning?: string;
}

export interface NutritionLookupResult {
  total_min: number;
  total_max: number;
  food_items: NutritionItemResult[];
}

export const lookup = async (items: FoodExtractionItem[]): Promise<NutritionLookupResult> => {
  let total_min = 0;
  let total_max = 0;
  const food_items: NutritionItemResult[] = [];

  for (const item of items) {
    const query = item.name.toLowerCase();
    const foundFood = localFoods.find((f) => f.name === query);

    if (foundFood) {
      const itemMin = foundFood.calories_min * item.quantity;
      const itemMax = foundFood.calories_max * item.quantity;
      total_min += itemMin;
      total_max += itemMax;

      food_items.push({
        name: foundFood.name,
        calories_min: itemMin,
        calories_max: itemMax,
        source: 'local_db',
      });
    } else {
      food_items.push({
        name: query,
        calories_min: null,
        calories_max: null,
        source: 'unknown',
        warning: `No calorie data available for '${query}'. Try rephrasing.`,
      });
    }
  }

  return {
    total_min,
    total_max,
    food_items,
  };
};
