export interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  originalText: string;
}

export interface NormalizedFoodNutrition {
  foodId?: string | number;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  grams?: number;
  calories: number | null;
  proteinGrams: number | null;
  fatGrams: number | null;
  carbsGrams: number | null;
  fiberGrams: number | null;
  source: 'calorie-api' | 'calorie-ninjas' | 'open-food-facts' | 'manual' | 'unknown';
  verified?: boolean;
  confidence: 'high' | 'medium' | 'low';
  failureReason?: string;
}

export type ChatResponseStatus = 'success' | 'needs_clarification' | 'error';

export interface FoodExtractionResult {
  items: NormalizedFoodNutrition[];
  meal_type: 'light' | 'medium' | 'heavy';
  confidence: number;
  ambiguous: boolean;
  status: ChatResponseStatus;
}
