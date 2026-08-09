import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env
config({ path: resolve(__dirname, '.env') });

import { CalorieNinjasService } from './src/modules/nutrition/calorie-ninjas.service';

import axios from 'axios';

async function main() {
  const apiKey = process.env.FOOD_CALORIE_API_KEY;
  console.log("API Key exists:", Boolean(apiKey));
  
  try {
    const response = await axios.get('https://calorieapiadmin.com/api/v1/search/foods', {
      params: { q: 'pancakes' },
      headers: { 'X-Api-Key': apiKey },
      timeout: 8000,
    });
    console.log("Response data:", response.data);
  } catch (error: any) {
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
  }
}

main();
