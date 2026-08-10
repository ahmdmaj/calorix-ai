import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { extract } from './ai.service';
import { CalorieApiService } from '../nutrition/calorie-ninjas.service';
import * as nutritionModule from '../nutrition/nutrition.service';

// Mock the entire CalorieApiService.lookupFood method
jest.mock('../nutrition/calorie-ninjas.service', () => ({
  CalorieApiService: {
    lookupFood: jest.fn(),
  },
}));

// ─── Shared mock helpers ───────────────────────────────────────────────────────

const makeFood = (name: string, calories: number, protein: number, fat: number, carbs: number, fiber = 0) => ({
  foodId: 1000,
  name,
  quantity: 1,
  unit: '1 Serving',
  grams: 100,
  calories,
  proteinGrams: protein,
  fatGrams: fat,
  carbsGrams: carbs,
  fiberGrams: fiber,
  source: 'calorie-api' as const,
  confidence: 'high' as const,
  verified: true,
});

const unknownFood = (name: string, reason = 'no_search_results') => ({
  name,
  quantity: 1,
  unit: 'serving',
  calories: null,
  proteinGrams: null,
  fatGrams: null,
  carbsGrams: null,
  fiberGrams: null,
  source: 'unknown' as const,
  confidence: 'low' as const,
  failureReason: reason,
});

const mockLookup = CalorieApiService.lookupFood as jest.MockedFunction<typeof CalorieApiService.lookupFood>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AI Service Extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. should look up pancakes and return calories', async () => {
    mockLookup.mockResolvedValue(makeFood('Pancakes', 227, 5.9, 7.6, 35.2, 1.5));

    const result = await extract('I had pancakes');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Pancakes');
    expect(result.items[0].calories).toBe(227);
    expect(result.items[0].proteinGrams).toBe(5.9);
    expect(result.items[0].fatGrams).toBe(7.6);
    expect(result.items[0].carbsGrams).toBe(35.2);
    expect(result.status).toBe('success');
  });

  it('2. should look up syrup and return calories', async () => {
    mockLookup.mockResolvedValue(makeFood('Maple Syrup', 261, 0, 0.1, 67.2));

    const result = await extract('syrup');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].calories).toBe(261);
    expect(result.status).toBe('success');
  });

  it('3. should look up banana and return calories', async () => {
    mockLookup.mockResolvedValue(makeFood('Banana', 89, 1.1, 0.3, 22.8, 2.6));

    const result = await extract('I ate a banana');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Banana');
    expect(result.items[0].calories).toBe(89);
    expect(result.status).toBe('success');
  });

  it('4. should look up boiled egg and return calories', async () => {
    mockLookup.mockResolvedValue(makeFood('Boiled Egg', 78, 6.3, 5.3, 0.6, 0));

    const result = await extract('boiled egg');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].calories).toBe(78);
    expect(result.status).toBe('success');
  });

  it('5. should handle multiple food items (pancakes with syrup)', async () => {
    mockLookup
      .mockResolvedValueOnce(makeFood('Pancakes', 227, 5.9, 7.6, 35.2))
      .mockResolvedValueOnce(makeFood('Maple Syrup', 261, 0, 0.1, 67.2));

    const result = await extract('I had pancakes with syrup');

    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe('Pancakes');
    expect(result.items[1].name).toBe('Maple Syrup');
    expect(result.items[0].calories).toBe(227);
    expect(result.items[1].calories).toBe(261);
    expect(result.status).toBe('success');
  });

  it('6. should return needs_clarification when API returns no results', async () => {
    mockLookup.mockResolvedValue(unknownFood('weird alien fruit'));

    const result = await extract('weird alien fruit');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].calories).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('7. should handle invalid API key (api_unauthorized)', async () => {
    mockLookup.mockResolvedValue(unknownFood('pancakes', 'api_unauthorized'));

    const result = await extract('pancakes');

    expect(result.items[0].calories).toBeNull();
    expect((result.items[0] as any).failureReason).toBe('api_unauthorized');
    expect(result.status).toBe('needs_clarification');
  });

  it('8. should handle rate limit (api_rate_limited)', async () => {
    mockLookup.mockResolvedValue(unknownFood('banana', 'api_rate_limited'));

    const result = await extract('banana');

    expect(result.items[0].calories).toBeNull();
    expect((result.items[0] as any).failureReason).toBe('api_rate_limited');
  });

  it('9. should handle timeout (request_timeout)', async () => {
    mockLookup.mockResolvedValue(unknownFood('egg', 'request_timeout'));

    const result = await extract('egg');

    expect(result.items[0].calories).toBeNull();
    expect((result.items[0] as any).failureReason).toBe('request_timeout');
  });

  it('10. should handle malformed API response (invalid_response_shape)', async () => {
    mockLookup.mockResolvedValue(unknownFood('apple', 'invalid_response_shape'));

    const result = await extract('apple');

    expect(result.items[0].calories).toBeNull();
    expect((result.items[0] as any).failureReason).toBe('invalid_response_shape');
  });

  it('11. should handle missing protein → needs_clarification', async () => {
    mockLookup.mockResolvedValue(unknownFood('mystery dish', 'nutrition_fields_missing'));

    const result = await extract('mystery dish');

    expect(result.items[0].proteinGrams).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('12. should handle missing fat → needs_clarification', async () => {
    mockLookup.mockResolvedValue(unknownFood('mystery dish', 'nutrition_fields_missing'));

    const result = await extract('mystery dish');

    expect(result.items[0].fatGrams).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('13. should handle missing carbs → needs_clarification', async () => {
    mockLookup.mockResolvedValue(unknownFood('mystery dish', 'nutrition_fields_missing'));

    const result = await extract('mystery dish');

    expect(result.items[0].carbsGrams).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('14. should correctly aggregate calories and macros across items', async () => {
    mockLookup
      .mockResolvedValueOnce(makeFood('Pancakes', 227, 5.9, 7.6, 35.2))
      .mockResolvedValueOnce(makeFood('Maple Syrup', 261, 0, 0.1, 67.2));

    const extraction = await extract('pancakes with syrup');
    const nutrition = await nutritionModule.lookup(extraction.items);

    expect(nutrition.total_min).toBeCloseTo(227 + 261, 0);
    expect(nutrition.total_protein_g).toBeCloseTo(5.9 + 0, 1);
    expect(nutrition.total_fat_g).toBeCloseTo(7.6 + 0.1, 1);
    expect(nutrition.total_carbs_g).toBeCloseTo(35.2 + 67.2, 1);
  });

  it('15. should never use a hardcoded 300 kcal fallback', async () => {
    mockLookup.mockResolvedValue(unknownFood('unknown food'));

    const result = await extract('unknown food');
    const nutrition = await nutritionModule.lookup(result.items);

    // If a food fails, its calories must be null — never silently filled with 300
    expect(result.items[0].calories).toBeNull();
    expect(nutrition.total_min).toBe(0);
    expect(nutrition.total_max).toBe(0);
  });

  it('16. should not convert missing macros to zero', async () => {
    mockLookup.mockResolvedValue(unknownFood('ghost food', 'no_search_results'));

    const result = await extract('ghost food');

    expect(result.items[0].proteinGrams).toBeNull();
    expect(result.items[0].fatGrams).toBeNull();
    expect(result.items[0].carbsGrams).toBeNull();
  });
});
