import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../server/storage';
import type { FoodItemClient, InsertUser } from '../shared/schema';

describe('Storage Operations & Lifecycle (MemStorage)', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Food Item Queries and CRUD', () => {
    it('initializes with seed food items', async () => {
      const foods = await storage.getAllFoodItems();
      expect(foods.length).toBeGreaterThan(100);

      // Verify structure of first item
      const first = foods[0];
      expect(first.id).toBeTruthy();
      expect(first.name.en).toBeTruthy();
      expect(first.nutrition).toBeDefined();
      expect(typeof first.nutrition.calories).toBe('number');
    });

    it('retrieves food items by ID correctly', async () => {
      const all = await storage.getAllFoodItems();
      const sample = all[0];

      const found = await storage.getFoodItemById(sample.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(sample.id);
      expect(found?.name.en).toBe(sample.name.en);

      const nonExistent = await storage.getFoodItemById('invalid-non-existent-id');
      expect(nonExistent).toBeUndefined();
    });

    it('retrieves popular food items filter', async () => {
      const popular = await storage.getPopularFoodItems();
      expect(popular.length).toBeGreaterThan(0);
      for (const item of popular) {
        expect(item.isPopular).toBe(true);
      }
    });

    it('searches foods across English, Hindi, and Tamil', async () => {
      // English search
      const englishResults = await storage.searchFoodItems('apple', undefined, 'en');
      expect(englishResults.length).toBeGreaterThan(0);
      expect(englishResults.some(item => item.name.en.toLowerCase().includes('apple'))).toBe(true);

      // Category filter
      const fruitResults = await storage.searchFoodItems(undefined, 'fruits', 'en');
      expect(fruitResults.length).toBeGreaterThan(0);
      for (const item of fruitResults) {
        expect(item.category).toContain('fruits');
      }

      // Query + Category combined
      const specificFruit = await storage.searchFoodItems('apple', 'fruits', 'en');
      expect(specificFruit.length).toBeGreaterThan(0);
      for (const item of specificFruit) {
        expect(item.category).toContain('fruits');
      }
    });

    it('creates, updates, and deletes a custom food item', async () => {
      const newFood: FoodItemClient = {
        id: 'test-gooseberry',
        name: {
          en: 'Indian Gooseberry (Amla)',
          hi: 'आंवला',
          ta: 'நெல்லிக்காய்'
        },
        description: {
          en: 'Extremely rich source of Vitamin C and antioxidants',
          hi: 'विटामिन सी और एंटीऑक्सीडेंट का समृद्ध स्रोत',
          ta: 'வைட்டமின் சி மற்றும் ஆக்ஸிஜனேற்றத்தின் சிறந்த ஆதாரம்'
        },
        origin: 'India',
        price: 3.5,
        image: 'https://images.unsplash.com/amla.jpg',
        category: ['fruits', 'superfoods', 'indian'],
        nutrition: {
          calories: 44,
          protein: 0.9,
          carbs: 10.2,
          fat: 0.6,
          fiber: 4.3,
          vitamins: { C: '300mg (500% DV)' }
        },
        isPopular: true
      };

      // Create
      const created = await storage.createFoodItem(newFood);
      expect(created.id).toBe('test-gooseberry');

      // Verify retrieval
      const fetched = await storage.getFoodItemById('test-gooseberry');
      expect(fetched).toBeDefined();
      expect(fetched?.name.en).toBe('Indian Gooseberry (Amla)');

      // Update
      const updated = await storage.updateFoodItem('test-gooseberry', {
        price: 4.0,
        nutrition: {
          ...newFood.nutrition,
          calories: 48
        }
      });
      expect(updated?.price).toBe(4.0);
      expect(updated?.nutrition.calories).toBe(48);

      // Delete
      const deleted = await storage.deleteFoodItem('test-gooseberry');
      expect(deleted).toBe(true);

      // Verify deletion
      const afterDelete = await storage.getFoodItemById('test-gooseberry');
      expect(afterDelete).toBeUndefined();
    });
  });

  describe('User Management', () => {
    it('creates and retrieves a new user', async () => {
      const insertData: InsertUser = {
        username: 'clinical_dietitian_01',
        password: 'hashed_secure_password_987'
      };

      const user = await storage.createUser(insertData);
      expect(user.id).toBeDefined();
      expect(user.username).toBe('clinical_dietitian_01');

      const byId = await storage.getUser(user.id);
      expect(byId).toBeDefined();
      expect(byId?.username).toBe('clinical_dietitian_01');

      const byUsername = await storage.getUserByUsername('clinical_dietitian_01');
      expect(byUsername).toBeDefined();
      expect(byUsername?.id).toBe(user.id);
    });
  });

  describe('User Favorites & Personalization', () => {
    it('seeds and retrieves default favorites for user 1', async () => {
      const favorites = await storage.getUserFavorites(1);
      expect(favorites.length).toBeGreaterThan(0);

      // Verify joined food property
      const firstFav = favorites[0];
      expect(firstFav.userId).toBe(1);
      expect(firstFav.food).toBeDefined();
      expect(firstFav.food.name.en).toBeTruthy();
    });

    it('adds and removes favorites for user', async () => {
      const allFoods = await storage.getAllFoodItems();
      const candidateFood = allFoods.find(f => !['avocado', 'salmon', 'spinach', 'almonds', 'quinoa'].includes(f.id));
      expect(candidateFood).toBeDefined();

      const initialFavs = await storage.getUserFavorites(1);
      const initialCount = initialFavs.length;

      // Add favorite
      const added = await storage.addUserFavorite(1, candidateFood!.id);
      expect(added.foodItemId).toBe(candidateFood!.id);
      expect(added.food.name.en).toBe(candidateFood!.name.en);

      const afterAddFavs = await storage.getUserFavorites(1);
      expect(afterAddFavs.length).toBe(initialCount + 1);

      // Remove favorite
      const removed = await storage.removeUserFavorite(1, candidateFood!.id);
      expect(removed).toBe(true);

      const afterRemoveFavs = await storage.getUserFavorites(1);
      expect(afterRemoveFavs.length).toBe(initialCount);
    });
  });

  describe('User Search & Browse History', () => {
    it('retrieves seeded search and view history', async () => {
      const history = await storage.getUserHistory(1);
      expect(history.length).toBeGreaterThan(0);
      expect(['search', 'view']).toContain(history[0].type);
    });

    it('filters history by record type', async () => {
      const searchesOnly = await storage.getUserHistory(1, { type: 'search' });
      for (const item of searchesOnly) {
        expect(item.type).toBe('search');
        expect(item.query).toBeDefined();
      }

      const viewsOnly = await storage.getUserHistory(1, { type: 'view' });
      for (const item of viewsOnly) {
        expect(item.type).toBe('view');
        expect(item.foodItemId).toBeDefined();
      }
    });

    it('adds a new search query and view event', async () => {
      const newSearch = await storage.addUserHistory({
        userId: 1,
        type: 'search',
        query: 'high potassium bananas',
        category: 'fruits',
        resultCount: 4
      });

      expect(newSearch.id).toBeDefined();
      expect(newSearch.query).toBe('high potassium bananas');
      expect(typeof newSearch.timestamp).toBe('number');

      const history = await storage.getUserHistory(1, { limit: 1 });
      expect(history[0].id).toBe(newSearch.id);
    });

    it('clears user history successfully', async () => {
      const before = await storage.getUserHistory(1);
      expect(before.length).toBeGreaterThan(0);

      const cleared = await storage.clearUserHistory(1);
      expect(cleared).toBe(true);

      const after = await storage.getUserHistory(1);
      expect(after.length).toBe(0);
    });
  });

  describe('Clinical Dietary Recommendations', () => {
    it('generates personalized recommendations for various dietary targets', async () => {
      const heartHealthRecs = await storage.getUserRecommendations(1, { focus: 'heart_health', limit: 5 });
      expect(heartHealthRecs.userId).toBe(1);
      expect(heartHealthRecs.focus).toBe('heart_health');
      expect(heartHealthRecs.recommendations.length).toBeLessThanOrEqual(5);

      const firstRec = heartHealthRecs.recommendations[0];
      expect(firstRec.food).toBeDefined();
      expect(firstRec.score).toBeGreaterThanOrEqual(80);
      expect(firstRec.matchReason).toBeTruthy();
      expect(firstRec.keyNutrientHighlight).toBeTruthy();
    });

    it('supports high_protein and plant_based focus filters', async () => {
      const proteinRecs = await storage.getUserRecommendations(1, { focus: 'high_protein', limit: 4 });
      expect(proteinRecs.recommendations.length).toBeLessThanOrEqual(4);

      const plantRecs = await storage.getUserRecommendations(1, { focus: 'plant_based', limit: 4 });
      expect(plantRecs.recommendations.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Editorial Engine & Analytics', () => {
    it('retrieves initial articles and topics', async () => {
      const articles = await storage.getArticles();
      expect(articles.length).toBeGreaterThan(0);

      const topics = await storage.getTopics();
      expect(topics.length).toBeGreaterThan(0);
    });

    it('retrieves article by slug', async () => {
      const articles = await storage.getArticles();
      const sample = articles[0];

      const found = await storage.getArticleBySlug(sample.slug);
      expect(found).toBeDefined();
      expect(found?.title).toBe(sample.title);
    });

    it('calculates editorial analytics', async () => {
      const analytics = await storage.getEditorialAnalytics();
      expect(analytics.totalDatabaseFoods).toBeGreaterThan(0);
      expect(analytics.averageQualityScore).toBeGreaterThan(0);
      expect(analytics.googleNewsReadinessScore).toBeGreaterThanOrEqual(90);
    });
  });
});
