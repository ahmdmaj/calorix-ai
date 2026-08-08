export interface FoodExtractionItem {
  name: string;
  quantity: number;
  unit: string;
  calories_min: number;
  calories_max: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
}

export interface FoodExtractionResult {
  items: FoodExtractionItem[];
  meal_type: 'light' | 'medium' | 'heavy';
  confidence: number;
  ambiguous: boolean;
  source: 'mock' | 'openai' | 'gemini' | 'openfoodfacts' | 'calorieapi';
}
