import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodExtractionResult } from './ai.types';

// 👇 Notice we removed the genAI initialization from up here!

export const extract = async (message: string): Promise<FoodExtractionResult> => {
  try {
    // 👇 We moved it INSIDE the function!
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

    const prompt = `You are a food entity extraction engine. Extract the food items from the user message. Return ONLY a valid JSON object matching this exact schema: { "items": [{ "name": "string", "quantity": number, "unit": "string" }], "meal_type": "light"|"medium"|"heavy", "confidence": number, "ambiguous": boolean }. Rules: Lowercase all food names. Normalise quantities. Do not invent items. User message: ${message}`;

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