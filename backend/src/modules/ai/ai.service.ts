import { FoodExtractionResult, NormalizedFoodNutrition, ParsedFoodItem, ChatResponseStatus } from './ai.types';
import { CalorieNinjasService } from '../nutrition/calorie-ninjas.service';

/**
 * Very basic NLP to extract potential food items from a message.
 * In a real app, this might use an LLM or specialized NLP library.
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

    // Simple heuristic for quantity: if it starts with a number (e.g. "2 eggs", "200g chicken")
    let quantity = 1;
    let unit = 'serving';
    let name = text;

    const qtyMatch = text.match(/^(\d+(?:\.\d+)?)\s*(g|oz|lb|cups?|slices?|pieces?)?\s+(.+)$/);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      if (qtyMatch[2]) {
        unit = qtyMatch[2];
      } else {
        unit = 'item';
      }
      name = qtyMatch[3];
    } else {
      // Check for 'a' or 'an' (e.g. "a banana")
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
      originalText: text, // The exact text we'll pass to CalorieNinjas since it understands natural language
    });
  }

  // Fallback if parsing fails to find anything
  if (parsedItems.length === 0) {
    parsedItems.push({
      name: message.trim(),
      quantity: 1,
      unit: 'serving',
      originalText: message.trim()
    });
  }

  return parsedItems;
}

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  try {
    const parsedItems = parseUserMessage(message);
    const normalizedItems: NormalizedFoodNutrition[] = [];
    
    let hasError = false;
    let needsClarification = false;

    // Process each item individually
    for (const item of parsedItems) {
      // We pass the *original text* (e.g. "2 eggs") to CalorieNinjas because it does NLP itself
      const cnItems = await CalorieNinjasService.queryNutrition(item.originalText);
      
      if (cnItems.length > 0) {
        // Take the first match (the best match from API)
        const normalized = CalorieNinjasService.normalizeItem(cnItems[0], item.originalText);
        normalizedItems.push(normalized);
        
        if (normalized.calories === null) {
          needsClarification = true;
        }
      } else {
        // Completely unknown food
        normalizedItems.push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          calories: null,
          proteinGrams: null,
          fatGrams: null,
          carbsGrams: null,
          fiberGrams: null,
          source: 'unknown',
          confidence: 'low'
        });
        needsClarification = true;
      }
    }

    let status: ChatResponseStatus = 'success';
    if (hasError) status = 'error';
    else if (needsClarification) status = 'needs_clarification';

    // Calculate approximate meal size for recommendations
    let meal_type: 'light' | 'medium' | 'heavy' = 'medium';
    let totalCalories = 0;
    
    normalizedItems.forEach(item => {
      if (item.calories) totalCalories += item.calories;
    });

    if (totalCalories < 300) meal_type = 'light';
    else if (totalCalories > 800) meal_type = 'heavy';

    // Confidence metric based on how many items were successfully parsed
    const successCount = normalizedItems.filter(item => item.calories !== null).length;
    const confidence = normalizedItems.length > 0 ? successCount / normalizedItems.length : 0;

    return {
      items: normalizedItems,
      meal_type,
      confidence,
      ambiguous: needsClarification,
      status
    };
  } catch (error) {
    console.error('[AI Service Error]:', error);
    return {
      items: [],
      meal_type: 'medium',
      confidence: 0,
      ambiguous: true,
      status: 'error'
    };
  }
};