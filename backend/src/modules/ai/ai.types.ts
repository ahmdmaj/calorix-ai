export interface FoodExtractionItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface FoodExtractionResult {
  items: FoodExtractionItem[];
  meal_type: 'light' | 'medium' | 'heavy';
  confidence: number;
  ambiguous: boolean;
  source: 'mock' | 'openai' | 'gemini';
}
