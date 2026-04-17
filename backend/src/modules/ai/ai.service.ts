import { FoodExtractionResult } from './ai.types';

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  return {
    items: [
      {
        name: message.toLowerCase().trim(),
        quantity: 1,
        unit: 'serving',
      },
    ],
    meal_type: 'medium',
    confidence: 0.75,
    ambiguous: false,
    source: 'mock',
  };
};
