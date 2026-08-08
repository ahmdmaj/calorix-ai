import { FoodExtractionResult } from './ai.types';
import axios from 'axios';

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  try {
    // Basic extraction of the core food term (ignoring filler words)
    const cleanMessage = message.toLowerCase()
      .replace(/i had|i ate|for lunch|for breakfast|for dinner|a piece of|a slice of|some/g, '')
      .trim();
    
    const mockItems = [];
    
    // 1. Try CalorieAPI first
    try {
      const calorieApiKey = process.env.FOOD_CALORIE_API_KEY;
      if (calorieApiKey) {
        const response = await axios.get(
          `https://api.calorieapi.com/api/v1/search`,
          {
            params: { q: cleanMessage },
            headers: { 'X-API-Key': calorieApiKey }
          }
        );

        if (response.data && response.data.length > 0) {
          const food = response.data[0];
          mockItems.push({
            name: food.name || cleanMessage,
            quantity: parseFloat(food.serving_size) || 1,
            unit: 'serving',
            calories_min: Math.round((food.calories || 150) * 0.9),
            calories_max: Math.round((food.calories || 150) * 1.1),
            protein_g: Math.round(food.protein_g || 0),
            fat_g: Math.round(food.fat_g || 0),
            carbs_g: Math.round(food.carbohydrates_g || 0),
          });
          
          return {
            items: mockItems,
            meal_type: 'medium',
            confidence: 0.95,
            ambiguous: false,
            source: 'calorieapi' as any
          };
        }
      }
    } catch (calorieApiError: any) {
      console.error('CalorieAPI error, falling through to OpenFoodFacts:', calorieApiError.message);
    }

    // 2. Fall back to OpenFoodFacts if CalorieAPI fails or returns no data
    const query = encodeURIComponent(cleanMessage);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      const nutriments = product.nutriments || {};
      
      // OpenFoodFacts returns per 100g. We assume a standard 200g serving if unknown.
      const multiplier = 2.0; 
      
      mockItems.push({
        name: product.product_name || cleanMessage,
        quantity: 1,
        unit: 'serving',
        calories_min: Math.round((nutriments['energy-kcal_100g'] || 150) * multiplier * 0.9),
        calories_max: Math.round((nutriments['energy-kcal_100g'] || 150) * multiplier * 1.1),
        protein_g: Math.round((nutriments['proteins_100g'] || 5) * multiplier),
        fat_g: Math.round((nutriments['fat_100g'] || 5) * multiplier),
        carbs_g: Math.round((nutriments['carbohydrates_100g'] || 20) * multiplier),
      });
    } else {
      // Fallback for completely unknown foods
      mockItems.push({ name: cleanMessage || 'unknown food', quantity: 1, unit: 'serving', calories_min: 250, calories_max: 350, protein_g: 10, fat_g: 12, carbs_g: 30 });
    }

    return { 
      items: mockItems, 
      meal_type: 'medium', 
      confidence: 0.8, 
      ambiguous: false, 
      source: 'openfoodfacts' as any
    };
  } catch (offError) {
    return { 
      items: [{ name: 'unknown food', quantity: 1, unit: 'serving', calories_min: 250, calories_max: 350, protein_g: 10, fat_g: 10, carbs_g: 20 }], 
      meal_type: 'medium', 
      confidence: 0, 
      ambiguous: true, 
      source: 'mock' 
    };
  }
};