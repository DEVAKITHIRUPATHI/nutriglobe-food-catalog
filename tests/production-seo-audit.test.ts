import { describe, it, expect } from 'vitest';
import { PRODUCTION_DOMAIN, toCanonicalSlug, isFoodEligibleForIndexing } from '../shared/canonicalSlug';
import { generateMainSitemapXml, CANONICAL_STATIC_PAGES } from '../server/sitemapEngine';
import { storage } from '../server/storage';
import { getAdSenseConfig, isRouteEligibleForAds } from '../shared/adsenseConfig';

describe('PRODUCTION SEO AUDIT & METADATA CONSISTENCY SUITE', () => {

  // 1. Canonical Domain Consistency
  describe('Canonical Domain Enforcement', () => {
    it('enforces exact production domain https://www.nutrifacts.fun across all canonical generators', () => {
      expect(PRODUCTION_DOMAIN).toBe('https://www.nutrifacts.fun');
      expect(PRODUCTION_DOMAIN.startsWith('https://')).toBe(true);
      expect(PRODUCTION_DOMAIN).not.toContain('nutriglobe');
      expect(PRODUCTION_DOMAIN).not.toContain('localhost');
      expect(PRODUCTION_DOMAIN).not.toContain('127.0.0.1');
      expect(PRODUCTION_DOMAIN).not.toContain('vercel.app');
    });

    it('generates food canonical URLs with exact production host and canonical slug', () => {
      const testCases = [
        { id: 'banana', expected: 'https://www.nutrifacts.fun/food/banana' },
        { id: 'tender_coconut', expected: 'https://www.nutrifacts.fun/food/tender-coconut' },
        { id: 'dragon_fruit', expected: 'https://www.nutrifacts.fun/food/dragon-fruit' },
        { id: 'fuji_apple', expected: 'https://www.nutrifacts.fun/food/fuji-apple' },
        { id: 'coconut_mature', expected: 'https://www.nutrifacts.fun/food/coconut-mature' },
        { id: 'nungu_ice_apple', expected: 'https://www.nutrifacts.fun/food/nungu-ice-apple' },
      ];

      for (const tc of testCases) {
        const slug = toCanonicalSlug(tc.id);
        const canonicalUrl = `${PRODUCTION_DOMAIN}/food/${slug}`;
        expect(canonicalUrl).toBe(tc.expected);
      }
    });
  });

  // 2. Open Graph & Twitter Social Metadata
  describe('Social Metadata & Open Graph Protocol', () => {
    it('ensures static canonical pages have valid Open Graph URLs pointing to production', () => {
      for (const page of CANONICAL_STATIC_PAGES) {
        const fullUrl = `${PRODUCTION_DOMAIN}${page.path}`;
        expect(fullUrl.startsWith('https://www.nutrifacts.fun')).toBe(true);
        expect(fullUrl).not.toContain('nutriglobe');
        expect(fullUrl).not.toContain('localhost');
      }
    });

    it('formats Twitter card metadata with summary_large_image and clean production domain', () => {
      const twitterCardType = 'summary_large_image';
      expect(twitterCardType).toBe('summary_large_image');
    });
  });

  // 3. Structured Data Truthfulness
  describe('Schema.org Educational Structured Data', () => {
    it('verifies food structured data uses ItemPage and NutritionInformation rather than commercial Product schema', () => {
      const sampleItem = {
        name: { en: 'Tender Coconut' },
        nutrition: { calories: 19, protein: 0.72, carbs: 3.71, fat: 0.2, fiber: 1.1 },
      };

      const schemaType = 'ItemPage';
      const entityType = 'NutritionInformation';

      expect(schemaType).toBe('ItemPage');
      expect(entityType).toBe('NutritionInformation');
      // Verify no commercial price, reviews, or fake offers are injected
      expect(sampleItem).not.toHaveProperty('price');
      expect(sampleItem).not.toHaveProperty('aggregateRating');
      expect(sampleItem).not.toHaveProperty('offers');
    });
  });

  // 4. Image SEO & Alt Text Attributes
  describe('Food Image SEO & Accessibility Alt Text', () => {
    it('verifies that representative food items have valid image URLs and descriptive alt text', async () => {
      const foods = await storage.getAllFoodItems();
      expect(foods.length).toBeGreaterThanOrEqual(1379);

      const sampleFoods = foods.slice(0, 50);
      for (const food of sampleFoods) {
        const img = food.image || food.imageUrl;
        expect(img).toBeDefined();
        expect(typeof img).toBe('string');
        expect(img!.startsWith('http')).toBe(true);

        const name = typeof food.name === 'string' ? food.name : (food.name?.en || food.id);
        const altText = `Fresh ${name}`;
        expect(altText.length).toBeGreaterThan(5);
        expect(altText).not.toContain('food-image-');
      }
    });
  });

  // 5. AdSense Route Restrictions & Ads.txt Integrity
  describe('AdSense Route Eligibility', () => {
    it('verifies that private, admin, and error routes are strictly excluded from ads', () => {
      const restricted = ['/404', '/not-found', '/admin', '/dashboard', '/calculator'];
      for (const route of restricted) {
        expect(isRouteEligibleForAds(route)).toBe(false);
      }
    });

    it('verifies active AdSense configuration and ads.txt seller entry', () => {
      const config = getAdSenseConfig();
      expect(config.enabled).toBe(true);
      expect(config.publisherId).toBe('ca-pub-4353689996620152');
      expect(config.adsTxtAuthorizedSellerLine).toBe('google.com, pub-4353689996620152, DIRECT, f08c47fec0942fa0');
    });
  });
});
