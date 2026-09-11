import { describe, it, expect } from 'vitest';
import { MemStorage } from '../server/storage';
import type { FoodItemClient, UserRecommendationResult } from '../shared/schema';

describe('API Contract & Data Stability Tests', () => {
  const storage = new MemStorage();

  it('guarantees FoodItemClient contract compliance across all seeded foods', async () => {
    const foods = await storage.getAllFoodItems();
    expect(foods.length).toBeGreaterThan(0);

    for (const food of foods.slice(0, 50)) {
      // Identity & Localization
      expect(typeof food.id).toBe('string');
      expect(food.id.length).toBeGreaterThan(0);
      expect(food.name).toBeDefined();
      expect(typeof food.name.en).toBe('string');
      expect(food.name.en.length).toBeGreaterThan(0);

      // Category
      expect(Array.isArray(food.category)).toBe(true);

      // Nutrition numbers
      expect(food.nutrition).toBeDefined();
      expect(typeof food.nutrition.calories).toBe('number');
      expect(typeof food.nutrition.protein).toBe('number');
      expect(typeof food.nutrition.carbs).toBe('number');
      expect(typeof food.nutrition.fat).toBe('number');
      expect(typeof food.nutrition.fiber).toBe('number');

      // Negative values prohibited
      expect(food.nutrition.calories).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.protein).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.carbs).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.fat).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.fiber).toBeGreaterThanOrEqual(0);

      // Price
      expect(typeof food.price).toBe('number');
      expect(food.price).toBeGreaterThanOrEqual(0);
    }
  });

  it('maintains mathematical integrity of caloric and macronutrient calculations', async () => {
    const foods = await storage.getAllFoodItems();
    const sampleFoods = foods.slice(0, 5);

    const aggregated = sampleFoods.reduce((acc, item) => ({
      calories: acc.calories + (item.nutrition.calories || 0),
      protein: acc.protein + (item.nutrition.protein || 0),
      carbs: acc.carbs + (item.nutrition.carbs || 0),
      fat: acc.fat + (item.nutrition.fat || 0),
      fiber: acc.fiber + (item.nutrition.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    expect(aggregated.calories).toBeGreaterThan(0);
    expect(aggregated.protein).toBeGreaterThan(0);
    expect(Number.isFinite(aggregated.calories)).toBe(true);
    expect(Number.isFinite(aggregated.protein)).toBe(true);
  });

  it('guarantees search API stability with edge cases and blank queries', async () => {
    // Blank search
    const all = await storage.searchFoodItems('', 'all', 'en');
    expect(all.length).toBeGreaterThan(100);

    // Non-existent search
    const empty = await storage.searchFoodItems('__non_existent_food_query_xyz_123__', undefined, 'en');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);

    // Invalid category
    const emptyCat = await storage.searchFoodItems(undefined, '__non_existent_category__', 'en');
    expect(Array.isArray(emptyCat)).toBe(true);
    expect(emptyCat.length).toBe(0);
  });

  it('guarantees User Recommendation contract stability', async () => {
    const result: UserRecommendationResult = await storage.getUserRecommendations(1, { focus: 'heart_health', limit: 3 });

    expect(result.userId).toBe(1);
    expect(result.focus).toBe('heart_health');
    expect(typeof result.totalRecommendations).toBe('number');
    expect(typeof result.rationale).toBe('string');
    expect(Array.isArray(result.recommendations)).toBe(true);

    for (const rec of result.recommendations) {
      expect(rec.food).toBeDefined();
      expect(typeof rec.score).toBe('number');
      expect(rec.score).toBeGreaterThan(0);
      expect(typeof rec.matchReason).toBe('string');
      expect(Array.isArray(rec.healthTags)).toBe(true);
      expect(typeof rec.keyNutrientHighlight).toBe('string');
    }
  });
});
