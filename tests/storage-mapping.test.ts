import { describe, it, expect } from 'vitest';
import { mapDbItemToFoodItemClient } from '../server/storage';

describe('Storage Data Mapping Integrity', () => {
  it('throws an error when input item is null or undefined', () => {
    expect(() => mapDbItemToFoodItemClient(null)).toThrow('Cannot map null or undefined item');
    expect(() => mapDbItemToFoodItemClient(undefined)).toThrow('Cannot map null or undefined item');
  });

  it('correctly maps currency from database cents to client dollars', () => {
    const itemWithCents = {
      itemId: 'food-price-test',
      nameEn: 'Organic Chia Seeds',
      price: 499, // 499 cents = $4.99
      calories: 486
    };

    const mapped = mapDbItemToFoodItemClient(itemWithCents);
    expect(mapped.price).toBe(4.99);

    // Free item
    const freeItem = { itemId: 'free-item', price: 0 };
    expect(mapDbItemToFoodItemClient(freeItem).price).toBe(0);

    // Missing price defaults to 0
    const noPriceItem = { itemId: 'no-price' };
    expect(mapDbItemToFoodItemClient(noPriceItem).price).toBe(0);
  });

  it('correctly converts macronutrients from database decigrams to client grams', () => {
    const rawDbRow = {
      itemId: 'food-macro-test',
      nameEn: 'Greek Yogurt',
      calories: 120,
      carbs: 45,    // 45 decigrams = 4.5 grams
      protein: 100, // 100 decigrams = 10.0 grams
      fat: 20,      // 20 decigrams = 2.0 grams
      fiber: 0      // 0 decigrams = 0 grams
    };

    const mapped = mapDbItemToFoodItemClient(rawDbRow);
    expect(mapped.nutrition.calories).toBe(120);
    expect(mapped.nutrition.carbs).toBe(4.5);
    expect(mapped.nutrition.protein).toBe(10);
    expect(mapped.nutrition.fat).toBe(2);
    expect(mapped.nutrition.fiber).toBe(0);
  });

  it('handles snake_case database columns seamlessly', () => {
    const snakeCaseRow = {
      item_id: 'db_row_123',
      name_en: 'Atlantic Salmon',
      name_hi: 'सैल्मन मछली',
      name_ta: 'சால்மன் மீன்',
      description_en: 'Wild caught salmon rich in omega-3',
      description_hi: 'ओमेगा-3 से भरपूर जंगली सैल्मन',
      description_ta: 'ஒமேகா-3 நிறைந்த காட்டு சால்மன்',
      price: 1299,
      calories: 208,
      carbs: 0,
      protein: 200, // 20.0g
      fat: 130,     // 13.0g
      fiber: 0,
      is_popular: 1,
      image_url: 'https://images.unsplash.com/salmon.jpg',
      category: ['seafood', 'heart_health']
    };

    const mapped = mapDbItemToFoodItemClient(snakeCaseRow);
    expect(mapped.id).toBe('db_row_123');
    expect(mapped.name.en).toBe('Atlantic Salmon');
    expect(mapped.name.hi).toBe('सैल्मन मछली');
    expect(mapped.name.ta).toBe('சால்மன் மீன்');
    expect(mapped.description.en).toBe('Wild caught salmon rich in omega-3');
    expect(mapped.price).toBe(12.99);
    expect(mapped.nutrition.protein).toBe(20);
    expect(mapped.nutrition.fat).toBe(13);
    expect(mapped.isPopular).toBe(true);
    expect(mapped.image).toBe('https://images.unsplash.com/salmon.jpg');
    expect(mapped.category).toEqual(['seafood', 'heart_health']);
  });

  it('handles camelCase database columns seamlessly', () => {
    const camelCaseRow = {
      itemId: 'camel_row_456',
      nameEn: 'Moringa Leaves',
      nameHi: 'सहजन के पत्ते',
      nameTa: 'முருங்கைக்கீரை',
      descriptionEn: 'High iron and calcium traditional superfood',
      price: 150,
      calories: 64,
      carbs: 82,   // 8.2g
      protein: 94, // 9.4g
      fat: 14,     // 1.4g
      fiber: 20,   // 2.0g
      isPopular: true,
      imageUrl: 'https://images.unsplash.com/moringa.jpg',
      categories: ['vegetables', 'indian']
    };

    const mapped = mapDbItemToFoodItemClient(camelCaseRow);
    expect(mapped.id).toBe('camel_row_456');
    expect(mapped.name.en).toBe('Moringa Leaves');
    expect(mapped.name.hi).toBe('सहजन के पत्ते');
    expect(mapped.nutrition.carbs).toBe(8.2);
    expect(mapped.nutrition.protein).toBe(9.4);
    expect(mapped.category).toEqual(['vegetables', 'indian']);
    expect(mapped.isPopular).toBe(true);
  });

  it('normalizes single string category to array', () => {
    const singleCatRow = {
      itemId: 'test-single-cat',
      nameEn: 'Banana',
      category: 'fruits'
    };

    const mapped = mapDbItemToFoodItemClient(singleCatRow);
    expect(Array.isArray(mapped.category)).toBe(true);
    expect(mapped.category).toEqual(['fruits']);
  });

  it('preserves rich micronutrient structures and health markers', () => {
    const richRow = {
      itemId: 'walnut-raw',
      nameEn: 'California Walnuts',
      vitamins: { B6: '25% DV', E: '10% DV' },
      minerals: { Magnesium: '38% DV', Copper: '50% DV' },
      omega3: '2.5g',
      omega6: '10.8g',
      antioxidants: { Polyphenols: 'High', Melatonin: 'Active' },
      allergens: ['tree_nuts'],
      healthBenefits: ['Cardiovascular support', 'Brain health'],
      recommendedIntake: '28g per day'
    };

    const mapped = mapDbItemToFoodItemClient(richRow);
    expect(mapped.nutrition.vitamins).toEqual({ B6: '25% DV', E: '10% DV' });
    expect(mapped.nutrition.minerals).toEqual({ Magnesium: '38% DV', Copper: '50% DV' });
    expect(mapped.nutrition.omega3).toBe('2.5g');
    expect(mapped.nutrition.omega6).toBe('10.8g');
    expect(mapped.nutrition.antioxidants).toEqual({ Polyphenols: 'High', Melatonin: 'Active' });
    expect(mapped.allergens).toEqual(['tree_nuts']);
    expect(mapped.healthBenefits).toEqual(['Cardiovascular support', 'Brain health']);
    expect(mapped.recommendedIntake).toBe('28g per day');
  });

  it('safely provides fallback defaults for missing or null values', () => {
    const minimalRow = {
      itemId: 'sparse-item'
    };

    const mapped = mapDbItemToFoodItemClient(minimalRow);
    expect(mapped.id).toBe('sparse-item');
    expect(mapped.name.en).toBe('');
    expect(mapped.name.hi).toBe('');
    expect(mapped.name.ta).toBe('');
    expect(mapped.description.en).toBe('');
    expect(mapped.price).toBe(0);
    expect(mapped.nutrition.calories).toBe(0);
    expect(mapped.nutrition.carbs).toBe(0);
    expect(mapped.nutrition.protein).toBe(0);
    expect(mapped.nutrition.fat).toBe(0);
    expect(mapped.nutrition.fiber).toBe(0);
    expect(mapped.category).toEqual([]);
    expect(mapped.allergens).toEqual([]);
    expect(mapped.isPopular).toBe(false);
  });
});
