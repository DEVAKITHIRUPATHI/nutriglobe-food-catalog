import { describe, it, expect } from 'vitest';
import { FallbackStorage, MemStorage } from '../server/storage';

describe('Storage Fallback Resilience (100% Uptime)', () => {
  it('instantiates FallbackStorage and provides food data', async () => {
    const fallbackStorage = new FallbackStorage();
    const foods = await fallbackStorage.getAllFoodItems();
    expect(foods.length).toBeGreaterThan(0);
  });

  it('retrieves food by id through fallback storage', async () => {
    const fallbackStorage = new FallbackStorage();
    const all = await fallbackStorage.getAllFoodItems();
    const sample = all[0];

    const retrieved = await fallbackStorage.getFoodItemById(sample.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(sample.id);
  });

  it('handles database errors gracefully and transitions to in-memory fallback', async () => {
    const fallbackStorage = new FallbackStorage();

    // Force dbStorage method to reject with a simulated connection error
    (fallbackStorage as any).dbStorage = {
      getAllFoodItems: async () => {
        throw new Error('connect ECONNREFUSED 127.0.0.1:5432');
      },
      getUserFavorites: async () => {
        throw new Error('Database connection timed out');
      }
    };

    // The call should NOT throw! It should catch and return items from memStorage
    const foods = await fallbackStorage.getAllFoodItems();
    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBeGreaterThan(0);

    // Verify subsequent call also works without throwing
    const favorites = await fallbackStorage.getUserFavorites(1);
    expect(Array.isArray(favorites)).toBe(true);
  });

  it('searches and filters food items in fallback mode', async () => {
    const fallbackStorage = new FallbackStorage();
    const results = await fallbackStorage.searchFoodItems('salmon', undefined, 'en');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(item => item.name.en.toLowerCase().includes('salmon'))).toBe(true);
  });

  it('retains user history and recommendations in fallback storage', async () => {
    const fallbackStorage = new FallbackStorage();
    const history = await fallbackStorage.getUserHistory(1);
    expect(Array.isArray(history)).toBe(true);

    const recommendations = await fallbackStorage.getUserRecommendations(1, { focus: 'heart_health' });
    expect(recommendations).toBeDefined();
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
  });
});
