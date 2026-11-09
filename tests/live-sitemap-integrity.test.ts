import { describe, it, expect } from 'vitest';
import { generateMainSitemapXml, auditSitemapConsistency, CANONICAL_STATIC_PAGES } from '../server/sitemapEngine';
import { PRODUCTION_DOMAIN, toCanonicalSlug, isFoodEligibleForIndexing } from '../shared/canonicalSlug';
import { storage } from '../server/storage';

describe('LIVE SITEMAP INTEGRITY & COVERAGE SUITE', () => {

  it('generates master sitemap with exactly 1,395 URLs (1,379 foods + 14 static + 2 articles)', async () => {
    const xml = await generateMainSitemapXml(PRODUCTION_DOMAIN);

    const urlMatches = xml.match(/<url>/g);
    expect(urlMatches).not.toBeNull();
    expect(urlMatches!.length).toBe(1395);

    // Food URL count
    const foodMatches = xml.match(/<loc>https:\/\/www\.nutrifacts\.fun\/food\//g);
    expect(foodMatches).not.toBeNull();
    expect(foodMatches!.length).toBe(1379);

    // Old domain check
    expect(xml).not.toContain('nutriglobe.app');
    expect(xml).not.toContain('nutrifacts.app');
    expect(xml).not.toContain('localhost');
    expect(xml).not.toContain('vercel.app');
    expect(xml).not.toContain('<loc>http://');
  });

  it('ensures zero missing, zero duplicate, and zero invalid URLs in sitemap audit', async () => {
    const audit = await auditSitemapConsistency(PRODUCTION_DOMAIN);

    expect(audit.status).toBe('PASS');
    expect(audit.totalFoodRecords).toBe(1379);
    expect(audit.eligibleIndexableFoods).toBe(1379);
    expect(audit.canonicalFoodUrls).toBe(1379);
    expect(audit.sitemapFoodUrls).toBe(1379);
    expect(audit.staticUrlsCount).toBe(14);
    expect(audit.articleUrlsCount).toBe(2);
    expect(audit.totalSitemapUrls).toBe(1395);

    expect(audit.missingSitemapUrls).toBe(0);
    expect(audit.missingUrlsList).toHaveLength(0);
    expect(audit.duplicateSitemapUrls).toBe(0);
    expect(audit.duplicateUrlsList).toHaveLength(0);
    expect(audit.invalidSitemapUrls).toBe(0);
    expect(audit.invalidUrlsList).toHaveLength(0);
    expect(audit.redirectUrls).toBe(0);
    expect(audit.noindexUrls).toBe(0);
  });

  it('contains all 14 mandatory static canonical pages in sitemap', async () => {
    const xml = await generateMainSitemapXml(PRODUCTION_DOMAIN);

    const expectedStaticPaths = [
      'https://www.nutrifacts.fun',
      'https://www.nutrifacts.fun/foods',
      'https://www.nutrifacts.fun/nutrition',
      'https://www.nutrifacts.fun/calculator',
      'https://www.nutrifacts.fun/blog',
      'https://www.nutrifacts.fun/feed',
      'https://www.nutrifacts.fun/about',
      'https://www.nutrifacts.fun/contact',
      'https://www.nutrifacts.fun/editorial-policy',
      'https://www.nutrifacts.fun/disclaimer',
      'https://www.nutrifacts.fun/affiliate-disclosure',
      'https://www.nutrifacts.fun/cookie-policy',
      'https://www.nutrifacts.fun/privacy',
      'https://www.nutrifacts.fun/terms',
    ];

    for (const path of expectedStaticPaths) {
      expect(xml).toContain(`<loc>${path}</loc>`);
    }
  });

  it('guarantees every eligible food has a unique deterministic canonical slug', async () => {
    const foods = await storage.getAllFoodItems();
    const slugs = new Set<string>();

    for (const food of foods) {
      const slug = toCanonicalSlug(food.id);
      expect(slug).toBeDefined();
      expect(slug.length).toBeGreaterThan(0);
      expect(slugs.has(slug)).toBe(false); // No collisions
      slugs.add(slug);
    }

    expect(slugs.size).toBe(foods.length);
  });
});
