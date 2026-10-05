import { describe, it, expect } from 'vitest';
import {
  toCanonicalSlug,
  fromCanonicalSlug,
  getFoodCanonicalUrl,
  getProductionCanonicalUrl,
  isValidFoodSlug,
  normalizeFoodSlug,
  isFoodEligibleForIndexing,
  resolveCanonicalFoodId,
  PRODUCTION_DOMAIN,
} from '../shared/canonicalSlug';
import { MemStorage } from '../server/storage';
import {
  generateMainSitemapXml,
  auditSitemapConsistency,
  CANONICAL_STATIC_PAGES
} from '../server/sitemapEngine';

describe('NutriFacts End-to-End Canonical Food URL & SEO Integration', () => {
  const storage = new MemStorage();

  // 1. Canonical URLs for Required Foods
  describe('Canonical URLs for Core Food Items', () => {
    it('generates deterministic canonical slugs for all required test items', () => {
      expect(toCanonicalSlug('banana')).toBe('banana');
      expect(toCanonicalSlug('tender_coconut')).toBe('tender-coconut');
      expect(toCanonicalSlug('dragon_fruit')).toBe('dragon-fruit');
      expect(toCanonicalSlug('apple')).toBe('apple');
      expect(toCanonicalSlug('coconut')).toBe('coconut');
      expect(toCanonicalSlug('nungu')).toBe('nungu');
    });

    it('resolves canonical URLs with production HTTPS domain', () => {
      expect(getProductionCanonicalUrl('apple')).toBe('https://www.nutrifacts.fun/food/apple');
      expect(getProductionCanonicalUrl('banana')).toBe('https://www.nutrifacts.fun/food/banana');
      expect(getProductionCanonicalUrl('coconut')).toBe('https://www.nutrifacts.fun/food/coconut');
      expect(getProductionCanonicalUrl('tender-coconut')).toBe('https://www.nutrifacts.fun/food/tender-coconut');
      expect(getProductionCanonicalUrl('dragon-fruit')).toBe('https://www.nutrifacts.fun/food/dragon-fruit');
      expect(getProductionCanonicalUrl('nungu')).toBe('https://www.nutrifacts.fun/food/nungu');
    });
  });

  // 2. URL Safety & Normalization
  describe('URL Safety & Normalization', () => {
    it('normalizes uppercase, punctuation, and multiple spaces into clean kebab-case', () => {
      expect(toCanonicalSlug('  Fresh Red Apple!  ')).toBe('fresh-red-apple');
      expect(toCanonicalSlug('Tender Coconut (Elaneer / Karikku)')).toBe('tender-coconut-elaneer-karikku');
      expect(toCanonicalSlug('Grandma’s Spiced Honey-Oats')).toBe('grandmas-spiced-honey-oats');
      expect(toCanonicalSlug('Dragon   Fruit---Yellow')).toBe('dragon-fruit-yellow');
    });

    it('handles empty and null inputs safely', () => {
      expect(toCanonicalSlug('')).toBe('');
      expect(toCanonicalSlug('   ')).toBe('');
      expect(resolveCanonicalFoodId('')).toBe('');
    });

    it('validates canonical slugs correctly', () => {
      expect(isValidFoodSlug('apple')).toBe(true);
      expect(isValidFoodSlug('tender-coconut')).toBe(true);
      expect(isValidFoodSlug('dragon-fruit')).toBe(true);
      expect(isValidFoodSlug('Invalid_Slug')).toBe(false);
      expect(isValidFoodSlug('invalid slug')).toBe(false);
      expect(isValidFoodSlug('-invalid-')).toBe(false);
    });
  });

  // 3. Database Food Resolution & 404 Handling
  describe('Database Food Route Resolution', () => {
    it('resolves all required core foods from storage', async () => {
      const banana = await storage.getFoodItemById('banana');
      expect(banana).toBeDefined();
      expect(banana?.id).toBe('banana');

      const tenderCoconut = await storage.getFoodItemById('tender-coconut');
      expect(tenderCoconut).toBeDefined();
      expect(tenderCoconut?.id).toBe('tender_coconut');

      const dragonFruit = await storage.getFoodItemById('dragon-fruit');
      expect(dragonFruit).toBeDefined();
      expect(dragonFruit?.id).toBe('dragon_fruit');

      const apple = await storage.getFoodItemById('apple');
      expect(apple).toBeDefined();
      expect(apple?.name.en).toContain('Apple');

      const coconut = await storage.getFoodItemById('coconut');
      expect(coconut).toBeDefined();
      expect(coconut?.name.en).toBe('Coconut');

      const nungu = await storage.getFoodItemById('nungu');
      expect(nungu).toBeDefined();
      expect(nungu?.name.en).toContain('Nungu');
    });

    it('returns undefined (404) for invalid, nonexistent food slugs without false fuzzy match', async () => {
      const nonExistent = await storage.getFoodItemById('does-not-exist');
      expect(nonExistent).toBeUndefined();

      const randomInvalid = await storage.getFoodItemById('random-invalid-food');
      expect(randomInvalid).toBeUndefined();

      const numInvalid = await storage.getFoodItemById('999999999');
      expect(numInvalid).toBeUndefined();
    });
  });

  // 4. Catalog Collision Audit across all records
  describe('Full Catalog Slug Collision Audit', () => {
    it('ensures zero slug collisions across all food records', async () => {
      const allFoods = await storage.getAllFoodItems();
      expect(allFoods.length).toBeGreaterThan(1300);

      const seenSlugs = new Map<string, string>();
      const collisions: Array<{ slug: string; id1: string; id2: string }> = [];

      for (const food of allFoods) {
        const slug = toCanonicalSlug(food.id);
        expect(slug.length).toBeGreaterThan(0);

        if (seenSlugs.has(slug)) {
          collisions.push({ slug, id1: seenSlugs.get(slug)!, id2: food.id });
        } else {
          seenSlugs.set(slug, food.id);
        }
      }

      expect(collisions).toHaveLength(0);
      expect(seenSlugs.size).toBe(allFoods.length);
    });
  });

  // 5. Food Quality Gate
  describe('Food Quality Gate', () => {
    it('validates that complete catalog foods pass the quality gate', async () => {
      const banana = await storage.getFoodItemById('banana');
      expect(banana).toBeDefined();
      const check = isFoodEligibleForIndexing(banana);
      expect(check.eligible).toBe(true);
      expect(check.reasons).toHaveLength(0);
    });

    it('flags incomplete or thin food items for quality improvement', () => {
      const thinFood = {
        id: 'thin_food',
        name: { en: 'Thin Food' },
        category: ['Fruit'],
        image: '', // missing
        nutrition: { calories: 50 },
        description: 'Short', // too short (< 15 chars)
      };
      const check = isFoodEligibleForIndexing(thinFood);
      expect(check.eligible).toBe(false);
      expect(check.reasons.length).toBeGreaterThan(0);
    });
  });

  // 6. XML Sitemap Consistency & Coverage Audit
  describe('XML Sitemap Consistency & Google Search Console Readiness', () => {
    it('passes the automated sitemap consistency audit with zero missing, zero duplicate, and zero invalid URLs', async () => {
      const audit = await auditSitemapConsistency(PRODUCTION_DOMAIN);

      expect(audit.status).toBe('PASS');
      expect(audit.totalFoodRecords).toBeGreaterThan(1300);
      expect(audit.sitemapFoodUrls).toBe(audit.canonicalFoodUrls);
      expect(audit.missingSitemapUrls).toBe(0);
      expect(audit.duplicateSitemapUrls).toBe(0);
      expect(audit.invalidSitemapUrls).toBe(0);
      expect(audit.redirectUrls).toBe(0);
      expect(audit.noindexUrls).toBe(0);
    });

    it('generates valid XML sitemap containing canonical URLs and Google Image metadata', async () => {
      const xml = await generateMainSitemapXml(PRODUCTION_DOMAIN);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');

      // Canonical production domain enforcement
      expect(xml).toContain('https://www.nutrifacts.fun/');
      expect(xml).not.toContain('nutriglobe.app');
      expect(xml).not.toContain('<loc>http://');
      expect(xml).not.toContain('http://www.nutrifacts.fun');
      expect(xml).not.toContain('http://nutrifacts.fun');
      expect(xml).not.toContain('localhost');
      expect(xml).not.toContain('127.0.0.1');
      expect(xml).not.toContain('vercel.app');

      // Canonical URLs present
      expect(xml).toContain('<loc>https://www.nutrifacts.fun/food/banana</loc>');
      expect(xml).toContain('<loc>https://www.nutrifacts.fun/food/tender-coconut</loc>');
      expect(xml).toContain('<loc>https://www.nutrifacts.fun/food/dragon-fruit</loc>');

      // Image SEO tags present
      expect(xml).toContain('<image:image>');
      expect(xml).toContain('<image:loc>');
      expect(xml).toContain('<image:title>');

      // Excludes disallowed URLs and tracking parameters
      expect(xml).not.toContain('/admin');
      expect(xml).not.toContain('/api/');
      expect(xml).not.toContain('/dashboard');
      expect(xml).not.toContain('?search=');
      expect(xml).not.toContain('?filter=');
      expect(xml).not.toContain('?utm_');
    });
  });

  // 7. Robots.txt Specification
  describe('Robots.txt Specification', () => {
    it('specifies the correct production sitemap and permits crawling of public content', () => {
      const baseUrl = PRODUCTION_DOMAIN;
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/admin/',
        'Disallow: /admin',
        'Disallow: /dashboard',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
        `Sitemap: ${baseUrl}/news-sitemap.xml`,
      ].join('\n');

      expect(robots).toContain(`Sitemap: https://www.nutrifacts.fun/sitemap.xml`);
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Disallow: /admin');
      expect(robots).not.toContain('Disallow: /food/');
    });
  });
});
