import { NormalizedFoodNutrition } from '../ai/ai.types';

export interface NutritionItemResult {
  name: string;
  quantity: number;
  unit: string;
  calories: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  source: string;
  warning?: string;
  confidence: string;
}

export interface NutritionLookupResult {
  total_min: number;
  total_max: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  food_items: NutritionItemResult[];
}

export const lookup = async (items: NormalizedFoodNutrition[]): Promise<NutritionLookupResult> => {
  let total = 0;
  let total_protein_g = 0;
  let total_fat_g = 0;
  let total_carbs_g = 0;
  const food_items: NutritionItemResult[] = [];

  for (const item of items) {
    const hasCompleteMacros = 
      item.calories !== null && 
      item.proteinGrams !== null && 
      item.fatGrams !== null && 
      item.carbsGrams !== null;

    if (hasCompleteMacros) {
      total += item.calories!;
      total_protein_g += item.proteinGrams!;
      total_fat_g += item.fatGrams!;
      total_carbs_g += item.carbsGrams!;

      food_items.push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein_g: item.proteinGrams,
        fat_g: item.fatGrams,
        carbs_g: item.carbsGrams,
        fiber_g: item.fiberGrams,
        source: item.source,
        confidence: item.confidence,
      });
    } else {
      food_items.push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: null,
        protein_g: null,
        fat_g: null,
        carbs_g: null,
        fiber_g: null,
        source: item.source,
        confidence: item.confidence,
        warning: `Could not reliably identify macros for '${item.name}'. Needs clarification.`,
      });
    }
  }

  // Keeping total_min and total_max for backwards compatibility with the rest of the app, 
  // but using the exact total since CalorieNinjas gives us exact numbers.
  return {
    total_min: total,
    total_max: total,
    total_protein_g,
    total_fat_g,
    total_carbs_g,
    food_items,
  };
};
