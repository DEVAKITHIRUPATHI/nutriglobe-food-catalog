import { describe, it, expect } from 'vitest';
import {
  translateContent,
  getLocalizedText,
  translateFoodName,
  translateFoodDescription,
  isLanguageSupported,
  getLanguageMetadata,
  formatNutritionWithUnit,
  SUPPORTED_LANGUAGES,
  DEFAULT_TRANSLATIONS
} from '../shared/translationUtils';
import type { TranslatedContent, FoodItemClient } from '../shared/schema';

describe('Translation Utility Functions', () => {
  describe('translateContent', () => {
    const sampleContent: TranslatedContent = {
      en: 'Spinach',
      hi: 'पालक',
      ta: 'பசலைக்கீரை',
      es: 'Espinaca',
      fr: 'Épinard'
    };

    it('returns exact translation when target language is available', () => {
      expect(translateContent(sampleContent, 'hi')).toBe('पालक');
      expect(translateContent(sampleContent, 'ta')).toBe('பசலைக்கீரை');
      expect(translateContent(sampleContent, 'es')).toBe('Espinaca');
      expect(translateContent(sampleContent, 'fr')).toBe('Épinard');
      expect(translateContent(sampleContent, 'en')).toBe('Spinach');
    });

    it('falls back to English when requested language is missing', () => {
      // German 'de' is not in sampleContent
      expect(translateContent(sampleContent, 'de')).toBe('Spinach');
      // Japanese 'ja' is not in sampleContent
      expect(translateContent(sampleContent, 'ja')).toBe('Spinach');
    });

    it('falls back to first available translation if English is missing', () => {
      const nonEnglishContent = {
        hi: 'हल्दी',
        ta: 'மஞ்சள்'
      } as unknown as TranslatedContent;

      expect(translateContent(nonEnglishContent, 'de')).toBe('हल्दी');
    });

    it('handles empty strings and whitespace by falling back to next available', () => {
      const contentWithBlank: TranslatedContent = {
        en: 'Almonds',
        hi: '   ', // whitespace only
        ta: 'பாதாம்'
      };

      expect(translateContent(contentWithBlank, 'hi')).toBe('Almonds');
    });

    it('returns empty string when input is null, undefined, or empty object', () => {
      expect(translateContent(null as any)).toBe('');
      expect(translateContent(undefined as any)).toBe('');
      expect(translateContent({} as any)).toBe('');
    });

    it('respects a custom fallback language parameter', () => {
      const content = {
        es: 'Manzana',
        fr: 'Pomme'
      } as any;

      expect(translateContent(content, 'de', 'es')).toBe('Manzana');
    });
  });

  describe('getLocalizedText', () => {
    it('translates standard UI keys to requested language', () => {
      expect(getLocalizedText('app.name', 'hi')).toBe('न्यूट्रिफैक्ट्स');
      expect(getLocalizedText('app.name', 'ta')).toBe('நியூட்ரிபேக்ட்ஸ்');
      expect(getLocalizedText('app.name', 'en')).toBe('NutriFacts');
      expect(getLocalizedText('filter.fruits', 'hi')).toBe('फल');
      expect(getLocalizedText('filter.fruits', 'ta')).toBe('பழங்கள்');
    });

    it('falls back to English when translation is missing for the language', () => {
      // Spanish key not explicitly in all UI dictionary entries
      expect(getLocalizedText('home.title', 'es')).toBe('Discover Nutrition in Every Bite');
    });

    it('returns the key itself when key does not exist in dictionary', () => {
      expect(getLocalizedText('nonexistent.key.xyz', 'en')).toBe('nonexistent.key.xyz');
      expect(getLocalizedText('nonexistent.key.xyz', 'hi')).toBe('nonexistent.key.xyz');
    });

    it('handles empty or null key safely', () => {
      expect(getLocalizedText('')).toBe('');
      expect(getLocalizedText(null as any)).toBe('');
    });

    it('supports custom translation dictionaries', () => {
      const customDict = {
        'custom.greeting': {
          en: 'Hello Nutritionist',
          hi: 'नमस्ते पोषण विशेषज्ञ'
        }
      };

      expect(getLocalizedText('custom.greeting', 'hi', customDict)).toBe('नमस्ते पोषण विशेषज्ञ');
      expect(getLocalizedText('custom.greeting', 'en', customDict)).toBe('Hello Nutritionist');
      expect(getLocalizedText('custom.greeting', 'fr', customDict)).toBe('Hello Nutritionist');
    });

    it('validates critical UI dictionary entries are populated', () => {
      const criticalKeys = [
        'app.name',
        'home.title',
        'button.exploreFoods',
        'search.placeholder',
        'filter.fruits',
        'filter.vegetables',
        'food.calories',
        'food.protein',
        'cart.title',
        'nutrition.facts'
      ];

      for (const key of criticalKeys) {
        expect(DEFAULT_TRANSLATIONS[key]).toBeDefined();
        expect(DEFAULT_TRANSLATIONS[key].en).toBeTruthy();
        expect(DEFAULT_TRANSLATIONS[key].hi).toBeTruthy();
        expect(DEFAULT_TRANSLATIONS[key].ta).toBeTruthy();
      }
    });
  });

  describe('translateFoodName and translateFoodDescription', () => {
    const mockFood: FoodItemClient = {
      id: 'test-spinach',
      name: {
        en: 'Baby Spinach',
        hi: 'पालक',
        ta: 'பசலைக்கீரை'
      },
      description: {
        en: 'Rich in iron and vitamins',
        hi: 'आयरन और विटामिन से भरपूर',
        ta: 'இரும்பு மற்றும் வைட்டமின்கள் நிறைந்தது'
      },
      origin: 'India',
      price: 2.5,
      image: 'https://example.com/spinach.jpg',
      category: ['vegetables'],
      nutrition: {
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        vitamins: { A: '141% DV', C: '47% DV' }
      },
      isPopular: true
    };

    it('translates food name accurately', () => {
      expect(translateFoodName(mockFood, 'en')).toBe('Baby Spinach');
      expect(translateFoodName(mockFood, 'hi')).toBe('पालक');
      expect(translateFoodName(mockFood, 'ta')).toBe('பசலைக்கீரை');
      expect(translateFoodName(mockFood, 'es')).toBe('Baby Spinach'); // fallback
    });

    it('translates food description accurately', () => {
      expect(translateFoodDescription(mockFood, 'en')).toBe('Rich in iron and vitamins');
      expect(translateFoodDescription(mockFood, 'hi')).toBe('आयरन और विटामिन से भरपूर');
      expect(translateFoodDescription(mockFood, 'ta')).toBe('இரும்பு மற்றும் வைட்டமின்கள் நிறைந்தது');
      expect(translateFoodDescription(mockFood, 'de')).toBe('Rich in iron and vitamins'); // fallback
    });

    it('handles null food item safely', () => {
      expect(translateFoodName(null)).toBe('');
      expect(translateFoodDescription(undefined)).toBe('');
    });
  });

  describe('Language Codes & Metadata Integrity', () => {
    it('validates supported language codes correctly', () => {
      expect(isLanguageSupported('en')).toBe(true);
      expect(isLanguageSupported('hi')).toBe(true);
      expect(isLanguageSupported('ta')).toBe(true);
      expect(isLanguageSupported('te')).toBe(true);
      expect(isLanguageSupported('bn')).toBe(true);
      expect(isLanguageSupported('es')).toBe(true);
      expect(isLanguageSupported('fr')).toBe(true);
      expect(isLanguageSupported('ar')).toBe(true);
      expect(isLanguageSupported('ja')).toBe(true);
      expect(isLanguageSupported('zh')).toBe(true);

      // Unsupported
      expect(isLanguageSupported('xyz')).toBe(false);
      expect(isLanguageSupported('')).toBe(false);
      expect(isLanguageSupported('123')).toBe(false);
    });

    it('identifies RTL writing directions correctly', () => {
      const arMeta = getLanguageMetadata('ar');
      expect(arMeta).toBeDefined();
      expect(arMeta?.direction).toBe('rtl');

      const urMeta = getLanguageMetadata('ur');
      expect(urMeta).toBeDefined();
      expect(urMeta?.direction).toBe('rtl');

      const enMeta = getLanguageMetadata('en');
      expect(enMeta).toBeDefined();
      expect(enMeta?.direction).toBe('ltr');
    });

    it('correctly classifies Indian regional vs international languages', () => {
      const hiMeta = getLanguageMetadata('hi');
      expect(hiMeta?.isIndianLanguage).toBe(true);

      const taMeta = getLanguageMetadata('ta');
      expect(taMeta?.isIndianLanguage).toBe(true);

      const frMeta = getLanguageMetadata('fr');
      expect(frMeta?.isIndianLanguage).toBe(false);

      const esMeta = getLanguageMetadata('es');
      expect(esMeta?.isIndianLanguage).toBe(false);
    });

    it('has valid metadata structure for all supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(25);
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.nativeName).toBeTruthy();
        expect(['ltr', 'rtl']).toContain(lang.direction);
        expect(typeof lang.isIndianLanguage).toBe('boolean');
      }
    });
  });

  describe('formatNutritionWithUnit', () => {
    it('formats numbers with specified units and precision', () => {
      expect(formatNutritionWithUnit(25.456, 'g', 1)).toBe('25.5 g');
      expect(formatNutritionWithUnit(100, 'kcal', 0)).toBe('100 kcal');
      expect(formatNutritionWithUnit(3.2, 'mg', 2)).toBe('3.2 mg');
    });

    it('handles undefined, null, and NaN safely with 0 fallback', () => {
      expect(formatNutritionWithUnit(undefined, 'g')).toBe('0 g');
      expect(formatNutritionWithUnit(null, 'kcal')).toBe('0 kcal');
      expect(formatNutritionWithUnit(NaN, 'mg')).toBe('0 mg');
    });
  });
});
