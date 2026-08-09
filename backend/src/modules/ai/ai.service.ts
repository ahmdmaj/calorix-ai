import { FoodExtractionResult, NormalizedFoodNutrition, ParsedFoodItem, ChatResponseStatus } from './ai.types';
import { CalorieApiService } from '../nutrition/calorie-ninjas.service';

/**
 * Parses the user's natural-language message into individual food items.
 */
function parseUserMessage(message: string): ParsedFoodItem[] {
  // 1. Remove common filler phrases
  let cleanMessage = message.toLowerCase()
    .replace(/i had|i ate|for lunch|for breakfast|for dinner|for a snack/g, '')
    .replace(/some /g, '')
    .trim();

  // 2. Split by common delimiters (and, comma, with)
  const parts = cleanMessage.split(/\s+and\s+|,|\s+with\s+/);

  const parsedItems: ParsedFoodItem[] = [];

  for (const part of parts) {
    const text = part.trim();
    if (!text) continue;

    let quantity = 1;
    let unit = 'serving';
    let name = text;

    // Match "2 eggs", "200g chicken", "2 slices bread"
    const qtyMatch = text.match(/^(\d+(?:\.\d+)?)\s*(g|oz|lb|cups?|slices?|pieces?)?\s+(.+)$/);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      unit = qtyMatch[2] || 'item';
      name = qtyMatch[3];
    } else {
      // Match "a banana", "an egg"
      const aMatch = text.match(/^(?:a|an)\s+(.+)$/);
      if (aMatch) {
        quantity = 1;
        unit = 'item';
        name = aMatch[1];
      }
    }

    parsedItems.push({
      name: name.trim(),
      quantity,
      unit,
      originalText: text,
    });
  }

  // Fallback if nothing was parsed
  if (parsedItems.length === 0) {
    parsedItems.push({
      name: message.trim(),
      quantity: 1,
      unit: 'serving',
      originalText: message.trim(),
    });
  }

  return parsedItems;
}

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  console.log('[AI] Input message:', message);

  try {
    const parsedItems = parseUserMessage(message);
    console.log('[AI] Extracted items:', parsedItems.map((i) => i.name));

    const normalizedItems: NormalizedFoodNutrition[] = [];
    let needsClarification = false;

    // Process each food item independently via the Calorie API
    for (const item of parsedItems) {
      console.log('[AI] Looking up:', item.originalText);
      const result = await CalorieApiService.lookupFood(item.originalText);
      normalizedItems.push(result);

      if (result.calories === null) {
        needsClarification = true;
      }
    }

    // Determine overall status
    let status: ChatResponseStatus = 'success';
    if (needsClarification) status = 'needs_clarification';

    // Classify meal size by total calories
    let meal_type: 'light' | 'medium' | 'heavy' = 'medium';
    const totalCalories = normalizedItems.reduce((sum, item) => sum + (item.calories ?? 0), 0);

    if (totalCalories < 300) meal_type = 'light';
    else if (totalCalories > 800) meal_type = 'heavy';

    const successCount = normalizedItems.filter((item) => item.calories !== null).length;
    const confidence = normalizedItems.length > 0 ? successCount / normalizedItems.length : 0;

    console.log('[AI] Result:', { status, totalCalories, meal_type, confidence });

    return {
      items: normalizedItems,
      meal_type,
      confidence,
      ambiguous: needsClarification,
      status,
    };
  } catch (error) {
    console.error('[AI Service Error]:', error);
    return {
      items: [],
      meal_type: 'medium',
      confidence: 0,
      ambiguous: true,
      status: 'error',
    };
  }
};