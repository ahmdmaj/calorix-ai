import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodExtractionResult } from './ai.types';
import axios from 'axios';

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  try {
    console.log("🕵️ KEY CHECK:", process.env.GEMINI_API_KEY?.substring(0, 15) + "...");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is completely missing from process.env!");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `You are a nutrition expert and food calorie estimation engine.
The user will describe food they ate. Extract all food items and estimate their calories.

Return ONLY a valid JSON object with this EXACT schema:
{
  "items": [
    {
      "name": "string (lowercase food name)",
      "quantity": number (numeric quantity, default 1 if not specified),
      "unit": "string (e.g. piece, cup, gram, slice, bowl)",
      "calories_min": number (lower bound calorie estimate for the given quantity),
      "calories_max": number (upper bound calorie estimate for the given quantity),
      "protein_g": number (estimated protein in grams),
      "fat_g": number (estimated fat in grams),
      "carbs_g": number (estimated carbohydrates in grams)
    }
  ],
  "meal_type": "light" | "medium" | "heavy",
  "confidence": number (0 to 1),
  "ambiguous": boolean
}

Rules:
- Estimate calories for EVERY food item, no matter what it is — use your nutrition knowledge.
- Use realistic, well-known calorie values (e.g., 1 medium apple ≈ 80-95 kcal).
- If quantity is unclear, assume a standard serving size.
- Calories should reflect the stated quantity (e.g., 2 eggs = ~140-160 kcal total).
- Do NOT return null or 0 for calories unless the item genuinely has no calories (e.g., water).
- Lowercase all food names.
- Support any food from any cuisine worldwide (Sri Lankan, Indian, Western, etc.).

User message: ${message}`;

    const result = await model.generateContent(prompt);
    const parsedText = result.response.text();
    const foodData = JSON.parse(parsedText);

    console.log("🧠 GEMINI OUTPUT:", JSON.stringify(foodData, null, 2));

    return { ...foodData, source: 'gemini' };
  } catch (error) {
    console.error("❌ AI Service Error (Falling back to CalorieAPI/OpenFoodFacts):", error.message);
    
    // NO API KEY REQUIRED FOR OPENFOODFACTS - REAL LIVE DATA FALLBACK
    try {
      // Basic extraction of the core food term (ignoring filler words)
      const cleanMessage = message.toLowerCase()
        .replace(/i had|i ate|for lunch|for breakfast|for dinner|a piece of|a slice of|some/g, '')
        .trim();
      
      const mockItems = [];
      
      // 1. Try CalorieAPI first
      try {
        const calorieApiKey = process.env.CALORIE_API_KEY;
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
              source: 'calorieapi'
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
        source: 'openfoodfacts' 
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
  }
};