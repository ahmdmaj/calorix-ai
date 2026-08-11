import { IProfile } from '../user/user.model';
import { NutritionLookupResult } from '../nutrition/nutrition.service';

export interface ActivityRecommendation {
  type: string;
  duration_minutes: number;
}

export interface RecommendationResult {
  consumption_time: string;
  frequency: string;
  activities: ActivityRecommendation[];
  health_tips: string[];
  disclaimer: string;
}

const MET: Record<string, number> = {
  walking: 4.5,
  running: 9.8,
  badminton: 7.0,
  cycling: 7.5,
};

const activityDuration = (totalCalories: number, met: number, weightKg: number): number => {
  return Math.round(totalCalories / ((met * weightKg) / 60));
};

/**
 * Generates context-aware health tips based on macros, fat level, food names,
 * and calorie total. Returns 2-4 short, actionable tips.
 */
function generateHealthTips(nutrition: NutritionLookupResult, userMessage?: string): string[] {
  const tips: string[] = [];

  const { total_min, total_protein_g, total_fat_g, total_carbs_g, food_items } = nutrition;
  const totalMacros = total_protein_g + total_fat_g + total_carbs_g || 1;

  const fatPct     = (total_fat_g   / totalMacros) * 100;
  const proteinPct = (total_protein_g / totalMacros) * 100;
  const carbsPct   = (total_carbs_g / totalMacros) * 100;

  const foodNames = food_items.map((f) => f.name.toLowerCase()).join(' ');

  const isDinner = userMessage ? /dinner|supper|night|evening/i.test(userMessage) : false;

  // ── Calorie level tips ───────────────────────────────────────────────────
  if (isDinner && total_min > 600) {
    tips.push('Consuming excessive calories for dinner is not good for your health. Consider a lighter meal in the evening to support digestion and better sleep.');
  } else if (total_min > 700) {
    tips.push('This is a high-calorie meal. Consider pairing it with a lighter snack later in the day to stay within your daily goal.');
  } else if (total_min < 200) {
    tips.push('This is a light portion. Make sure you are eating enough throughout the day to meet your energy needs.');
  }

  // ── Fat level tips ───────────────────────────────────────────────────────
  if (fatPct > 45) {
    tips.push(`Fat makes up ${Math.round(fatPct)}% of this meal's macros — quite high. Try to balance it with a low-fat, fibre-rich meal next time (e.g. salad, lentils, or steamed vegetables).`);
  } else if (fatPct > 30) {
    tips.push(`Fat is ${Math.round(fatPct)}% of this meal. Moderate fat intake is fine, but watch out for saturated fats — opt for olive oil, avocado, or nuts over fried or processed foods.`);
  } else if (fatPct < 10 && total_min > 100) {
    tips.push('This meal is very low in fat. Including a small amount of healthy fat (e.g. a drizzle of olive oil or a handful of nuts) helps absorb fat-soluble vitamins.');
  }

  // ── Protein tips ─────────────────────────────────────────────────────────
  if (proteinPct > 40) {
    tips.push(`Great protein content (${Math.round(proteinPct)}%)! High protein supports muscle repair and keeps you satiated longer. Stay well hydrated when eating high-protein meals.`);
  } else if (proteinPct < 15 && total_min > 200) {
    tips.push(`This meal is relatively low in protein (${Math.round(proteinPct)}%). Consider adding a protein source like eggs, legumes, chicken, or Greek yogurt to support muscle health and satiety.`);
  }

  // ── Carb tips ────────────────────────────────────────────────────────────
  if (carbsPct > 60) {
    tips.push(`Carbs make up ${Math.round(carbsPct)}% of this meal. If these are refined carbs, consider switching some to complex carbs like oats, brown rice, or whole-grain bread for sustained energy.`);
  }

  // ── Food-specific tips ───────────────────────────────────────────────────
  if (/fried|fries|chips|deep.?fried|kottu|rotti|paratha/.test(foodNames)) {
    tips.push('Fried and heavily processed foods are high in saturated fat. Try grilling, baking, or air-frying as healthier alternatives.');
  }

  if (/rice|white bread|noodle|pasta/.test(foodNames)) {
    tips.push('Refined grains cause quick blood-sugar spikes. Replacing some with brown rice, whole-wheat bread, or legumes can help maintain steady energy levels.');
  }

  if (/sugar|cake|cookie|doughnut|soda|juice|chocolate/.test(foodNames)) {
    tips.push('This meal includes items high in added sugar. Excess sugar contributes to fat storage and energy crashes — enjoy in moderation.');
  }

  if (/salad|vegetable|spinach|broccoli|cucumber|carrot/.test(foodNames)) {
    tips.push('Great choice including vegetables! They provide fibre, vitamins, and minerals that support digestion and overall health.');
  }

  if (/egg|chicken|fish|tuna|salmon|tofu|lentil|bean/.test(foodNames)) {
    tips.push('Good lean protein sources detected. These support muscle recovery and help keep you full for longer.');
  }

  if (/alcohol|beer|wine|whiskey/.test(foodNames)) {
    tips.push('Alcohol adds empty calories and can impair fat metabolism. Limit consumption and always eat food alongside alcoholic drinks.');
  }

  // ── Hydration reminder ───────────────────────────────────────────────────
  if (total_min > 400 || fatPct > 35) {
    tips.push('Drink plenty of water — aim for at least 8 glasses a day, especially after a heavier meal to aid digestion.');
  }

  // Return up to 4 of the most relevant tips
  return tips.slice(0, 4);
}

export const generate = async (
  totalCalories: number,
  userProfile: Partial<IProfile> | null,
  nutrition?: NutritionLookupResult,
  userMessage?: string
): Promise<RecommendationResult> => {
  const weightKg = userProfile?.weight_kg || 70;

  const activities = Object.entries(MET).map(([type, met]) => ({
    type,
    duration_minutes: activityDuration(totalCalories, met, weightKg),
  }));

  const health_tips = nutrition ? generateHealthTips(nutrition, userMessage) : [];

  const disclaimer =
    'This system provides general health guidance only and is not a substitute for medical advice. Calorie values are approximate. Activity recommendations are based on population averages and your stated profile. Consult a qualified health professional for personalised dietary guidance.';

  return {
    consumption_time: 'Standard meal time',
    frequency: 'Moderate consumption advised',
    activities,
    health_tips,
    disclaimer,
  };
};
