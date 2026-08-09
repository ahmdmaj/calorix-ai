import { extract } from './ai.service';
import { CalorieNinjasService } from '../nutrition/calorie-ninjas.service';
import * as nutritionModule from '../nutrition/nutrition.service';

// Mock the CalorieNinjas service to avoid hitting the actual API
jest.mock('../nutrition/calorie-ninjas.service');

describe('AI Service Extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEggResult = {
    name: 'egg',
    calories: 143,
    serving_size_g: 100,
    fat_total_g: 9.5,
    fat_saturated_g: 3.1,
    protein_g: 12.6,
    sodium_mg: 140,
    potassium_mg: 138,
    cholesterol_mg: 372,
    carbohydrates_total_g: 0.7,
    fiber_g: 0,
    sugar_g: 0.4
  };

  const mockChickenResult = {
    name: 'chicken breast',
    calories: 165,
    serving_size_g: 100,
    fat_total_g: 3.6,
    fat_saturated_g: 1,
    protein_g: 31,
    sodium_mg: 74,
    potassium_mg: 256,
    cholesterol_mg: 85,
    carbohydrates_total_g: 0,
    fiber_g: 0,
    sugar_g: 0
  };

  const mockToastResult = {
    name: 'toast',
    calories: 313,
    serving_size_g: 100,
    fat_total_g: 4.3,
    fat_saturated_g: 0.9,
    protein_g: 12.9,
    sodium_mg: 601,
    potassium_mg: 153,
    cholesterol_mg: 0,
    carbohydrates_total_g: 55.8,
    fiber_g: 4.4,
    sugar_g: 5.4
  };

  it('1. should extract "I had 2 eggs" correctly', async () => {
    // Setup mock
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([mockEggResult]);

    const result = await extract("I had 2 eggs");

    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('egg');
    expect(result.items[0].calories).toBe(143); // Handled by mocked normalizeItem, actually the app uses Math.round
    expect(result.status).toBe('success');
  });

  it('2. should extract "I ate 200g chicken breast" correctly', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([mockChickenResult]);

    const result = await extract("I ate 200g chicken breast");

    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('chicken breast');
    expect(result.status).toBe('success');
  });

  it('3. should extract "I had 2 eggs and 2 slices of toast" correctly', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockImplementation((query) => {
      if (query.includes('egg')) return Promise.resolve([mockEggResult]);
      if (query.includes('toast')) return Promise.resolve([mockToastResult]);
      return Promise.resolve([]);
    });

    const result = await extract("I had 2 eggs and 2 slices of toast");

    expect(result.items.length).toBe(2);
    expect(result.items[0].name).toBe('egg');
    expect(result.items[1].name).toBe('toast');
    expect(result.status).toBe('success');
  });

  it('4. should handle "I ate a banana"', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([{
      name: 'banana',
      calories: 89,
      serving_size_g: 100,
      fat_total_g: 0.3,
      fat_saturated_g: 0.1,
      protein_g: 1.1,
      sodium_mg: 1,
      potassium_mg: 358,
      cholesterol_mg: 0,
      carbohydrates_total_g: 22.8,
      fiber_g: 2.6,
      sugar_g: 12.2
    }]);

    const result = await extract("I ate a banana");

    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('banana');
    expect(result.status).toBe('success');
  });

  it('5. should handle branded packaged food', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([{
      name: 'oreo',
      calories: 479,
      serving_size_g: 100,
      fat_total_g: 20,
      fat_saturated_g: 5.7,
      protein_g: 4.8,
      sodium_mg: 382,
      potassium_mg: 172,
      cholesterol_mg: 0,
      carbohydrates_total_g: 69.4,
      fiber_g: 2.7,
      sugar_g: 38.1
    }]);

    const result = await extract("I ate 2 oreos");

    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('oreo');
    expect(result.status).toBe('success');
  });

  it('6. should handle an unknown food', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([]);

    const result = await extract("I ate a weird alien fruit");

    expect(result.items.length).toBe(1);
    expect(result.items[0].calories).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('7. should handle a food with no search results', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([]);

    const result = await extract("dsfdsfdsf");

    expect(result.items.length).toBe(1);
    expect(result.items[0].calories).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('8. should handle a food with missing macro fields', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([{
      name: 'broken food',
      calories: 100,
      serving_size_g: 100,
      // Missing other macros
    }]);

    const result = await extract("broken food");

    expect(result.items.length).toBe(1);
    expect(result.items[0].calories).toBeNull();
    expect(result.status).toBe('needs_clarification');
  });

  it('14. should scale quantity based on serving', async () => {
    // CalorieNinjas automatically scales based on the query text "2 eggs".
    // We just verify our normalization doesn't mess with it.
    const queryResult = {
      ...mockEggResult,
      calories: 286, // 143 * 2
      protein_g: 25.2 // 12.6 * 2
    };

    (CalorieNinjasService.queryNutrition as jest.Mock).mockResolvedValue([queryResult]);

    const result = await extract("2 eggs");

    expect(result.items[0].calories).toBe(286);
    expect(result.items[0].proteinGrams).toBe(25.2);
  });

  it('15. should correctly aggregate calories and all three macros', async () => {
    (CalorieNinjasService.queryNutrition as jest.Mock).mockImplementation((query) => {
      if (query.includes('egg')) return Promise.resolve([mockEggResult]);
      if (query.includes('toast')) return Promise.resolve([mockToastResult]);
      return Promise.resolve([]);
    });

    const extraction = await extract("1 egg and 1 toast");
    
    // Test the nutrition module lookup
    const nutrition = await nutritionModule.lookup(extraction.items);

    expect(nutrition.total_max).toBe(143 + 313);
    expect(nutrition.total_protein_g).toBe(12.6 + 12.9);
    expect(nutrition.total_fat_g).toBe(9.5 + 4.3);
    expect(nutrition.total_carbs_g).toBe(0.7 + 55.8);
  });
});
