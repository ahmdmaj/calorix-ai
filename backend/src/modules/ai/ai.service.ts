import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodExtractionResult } from './ai.types';

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
    console.error("❌ AI Service Error:", error);
    return { items: [], meal_type: 'medium', confidence: 0, ambiguous: true, source: 'gemini' };
  }
};