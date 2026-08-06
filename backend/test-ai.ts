import dotenv from 'dotenv';
dotenv.config();

import { extract } from './src/modules/ai/ai.service';
import { lookup } from './src/modules/nutrition/nutrition.service';

async function test() {
  const extracted = await extract("I had a chicken sandwich for lunch.");
  console.log("Extracted:", JSON.stringify(extracted, null, 2));

  const nutrition = await lookup(extracted.items);
  console.log("Nutrition:", JSON.stringify(nutrition, null, 2));
}

test();
