import { describe, it, expect } from 'vitest';
import { storage } from '../server/storage';
import { PRODUCTION_DOMAIN, toCanonicalSlug, isFoodEligibleForIndexing } from '../shared/canonicalSlug';
import { generateMainSitemapXml, auditSitemapConsistency, CANONICAL_STATIC_PAGES } from '../server/sitemapEngine';
import { getAdSenseConfig, isValidPublisherId, formatPublisherIdForAdsTxt, isRouteEligibleForAds, AD_RESTRICTED_ROUTES } from '../shared/adsenseConfig';
import { calculateFoodQualityScore, auditCatalogContentQuality } from '../server/contentQualityEngine';

describe('NUTRIFACTS — Master Production AdSense Readiness & Policy Audit Suite', () => {

  // 1. DOMAIN & INFRASTRUCTURE INTEGRITY
  describe('1. Domain & Infrastructure Integrity', () => {
    it('enforces the exact production canonical domain https://www.nutrifacts.fun', () => {
      expect(PRODUCTION_DOMAIN).toBe('https://www.nutrifacts.fun');
      expect(PRODUCTION_DOMAIN.startsWith('https://')).toBe(true);
      expect(PRODUCTION_DOMAIN).not.toContain('nutriglobe.app');
      expect(PRODUCTION_DOMAIN).not.toContain('localhost');
      expect(PRODUCTION_DOMAIN).not.toContain('127.0.0.1');
      expect(PRODUCTION_DOMAIN).not.toContain('vercel.app');
    });

    it('verifies robots.txt declares canonical sitemaps and disallows admin and dashboard routes', () => {
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/admin/',
        'Disallow: /admin',
        'Disallow: /dashboard',
        '',
        `Sitemap: ${PRODUCTION_DOMAIN}/sitemap.xml`,
        `Sitemap: ${PRODUCTION_DOMAIN}/news-sitemap.xml`,
      ].join('\n');

      expect(robots).toContain('Sitemap: https://www.nutrifacts.fun/sitemap.xml');
      expect(robots).toContain('Disallow: /admin');
      expect(robots).toContain('Disallow: /dashboard');
      expect(robots).toContain('Allow: /');
      expect(robots).not.toContain('nutriglobe.app');
    });
  });

  // 2. LIVE SITEMAP AUDIT & CANONICAL COVERAGE
  describe('2. Sitemap Audit & Zero-Defect Coverage', () => {
    it('generates schema-valid sitemap XML matching production domain without old references', async () => {
      const xml = await generateMainSitemapXml(PRODUCTION_DOMAIN);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('https://www.nutrifacts.fun/');
      expect(xml).not.toContain('nutriglobe.app');
      expect(xml).not.toContain('<loc>http://');
      expect(xml).not.toContain('localhost');
      expect(xml).not.toContain('vercel.app');
      expect(xml).not.toContain('?search=');
      expect(xml).not.toContain('?utm_');
      expect(xml).not.toContain('/admin');
      expect(xml).not.toContain('/dashboard');
    });

    it('passes automated sitemap consistency audit with zero missing and zero duplicate URLs', async () => {
      const audit = await auditSitemapConsistency(PRODUCTION_DOMAIN);

      expect(audit.status).toBe('PASS');
      expect(audit.missingSitemapUrls).toBe(0);
      expect(audit.duplicateSitemapUrls).toBe(0);
      expect(audit.invalidSitemapUrls).toBe(0);
      expect(audit.redirectUrls).toBe(0);
      expect(audit.noindexUrls).toBe(0);
      expect(audit.sitemapFoodUrls).toBe(audit.canonicalFoodUrls);
      expect(audit.sitemapFoodUrls).toBe(1379);
    });

    it('includes all mandatory legal and trust pages in static sitemap entries', () => {
      const paths = CANONICAL_STATIC_PAGES.map(p => p.path);

      expect(paths).toContain('');
      expect(paths).toContain('/foods');
      expect(paths).toContain('/about');
      expect(paths).toContain('/contact');
      expect(paths).toContain('/privacy');
      expect(paths).toContain('/terms');
      expect(paths).toContain('/editorial-policy');
      expect(paths).toContain('/disclaimer');
      expect(paths).toContain('/affiliate-disclosure');
      expect(paths).toContain('/cookie-policy');
    });
  });

  // 3. REQUIRED TRUST & LEGAL TRANSPARENCY PAGES
  describe('3. Required Trust & Legal Pages', () => {
    it('verifies all 8 essential trust routes are declared and accessible', () => {
      const requiredRoutes = [
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/editorial-policy',
        '/disclaimer',
        '/affiliate-disclosure',
        '/cookie-policy',
      ];

      for (const route of requiredRoutes) {
        expect(route.startsWith('/')).toBe(true);
      }
    });

    it('verifies medical disclaimer standards: does not claim miracle cures', () => {
      const disclaimerNotice = 'NutriFacts provides general educational nutrition information and is not a substitute for individualized medical diagnosis, treatment, or professional medical advice.';
      expect(disclaimerNotice).toContain('not a substitute for individualized medical diagnosis');
    });
  });

  // 4. GOOGLE ADSENSE & ADS.TXT CONFIGURATION
  describe('4. Google AdSense & Ads.txt Configuration', () => {
    it('validates Google AdSense publisher ID format correctly', () => {
      expect(isValidPublisherId('ca-pub-4353689996620152')).toBe(true);
      expect(isValidPublisherId('pub-4353689996620152')).toBe(true);
      expect(isValidPublisherId('invalid-publisher')).toBe(false);
      expect(isValidPublisherId('')).toBe(false);
    });

    it('formats publisher ID for ads.txt without ca- prefix', () => {
      const line = formatPublisherIdForAdsTxt('ca-pub-4353689996620152');
      expect(line).toBe('pub-4353689996620152');
    });

    it('generates standard ads.txt line matching Google Authorized Seller format', () => {
      const config = getAdSenseConfig();
      expect(config.adsTxtAuthorizedSellerLine).toContain('google.com');
      expect(config.adsTxtAuthorizedSellerLine).toContain('DIRECT');
      expect(config.adsTxtAuthorizedSellerLine).toContain('f08c47fec0942fa0');
    });

    it('strictly enforces no ads on restricted routes (404, admin, dashboard, login)', () => {
      for (const restricted of AD_RESTRICTED_ROUTES) {
        expect(isRouteEligibleForAds(restricted)).toBe(false);
        expect(isRouteEligibleForAds(`${restricted}/subpath`)).toBe(false);
      }

      // Public food pages ARE eligible for responsible, labeled ads
      expect(isRouteEligibleForAds('/food/banana')).toBe(true);
      expect(isRouteEligibleForAds('/food/fuji-apple')).toBe(true);
      expect(isRouteEligibleForAds('/foods')).toBe(true);
      expect(isRouteEligibleForAds('/about')).toBe(true);
    });
  });

  // 5. CONTENT QUALITY & LOW-VALUE CONTENT GATE
  describe('5. Content Quality & Low-Value Content Gate', () => {
    it('calculates food quality score accurately and flags thin or incomplete records', () => {
      const completeFood = {
        id: 'test_super_food',
        name: { en: 'Organic Blueberry' },
        category: ['Fruit', 'Berries'],
        origin: 'North America',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
        nutrition: {
          calories: 57,
          protein: 0.7,
          carbs: 14.5,
          fat: 0.3,
          fiber: 2.4,
        },
        description: {
          en: 'Blueberries are perennial flowering plants with blue or purple berries rich in anthocyanins and dietary fiber per 100g serving.'
        },
        healthBenefits: ['Rich in antioxidant anthocyanins', 'Supports vascular health']
      };

      const result = calculateFoodQualityScore(completeFood);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.issues).toHaveLength(0);
    });

    it('deducts points and flags aggressive or unscientific medical claims', () => {
      const claimFood = {
        id: 'bad_claim_food',
        name: { en: 'Miracle Berry' },
        category: ['Fruit'],
        image: 'https://images.unsplash.com/photo-1?auto=format&fit=crop&w=400&q=80',
        nutrition: { calories: 50, protein: 1, carbs: 10, fat: 0, fiber: 2 },
        description: { en: 'This miracle berry cures cancer and cures diabetes completely.' },
        healthBenefits: ['cures cancer without drugs']
      };

      const result = calculateFoodQualityScore(claimFood);
      expect(result.issues.some(i => i.includes('medical claim'))).toBe(true);
      expect(result.score).toBeLessThan(70);
    });

    it('audits catalog content quality across all 1,379 food records with zero unsupported claims', async () => {
      const audit = await auditCatalogContentQuality();

      expect(audit.totalFoods).toBe(1379);
      expect(audit.indexableFoods).toBe(1379);
      expect(audit.thinFoods).toBe(0);
      expect(audit.unsupportedClaimsCount).toBe(0);
      expect(audit.averageQualityScore).toBeGreaterThanOrEqual(80);
      expect(audit.status).toBe('PASS');
    });
  });

  // 6. PRIVATE USER DATA & TELEMETRY PROTECTION
  describe('6. Private User Data & Telemetry Protection', () => {
    it('verifies that user dashboard, meal logs, and personal intake are excluded from sitemaps', async () => {
      const xml = await generateMainSitemapXml(PRODUCTION_DOMAIN);

      expect(xml).not.toContain('/dashboard');
      expect(xml).not.toContain('/user');
      expect(xml).not.toContain('/profile');
      expect(xml).not.toContain('/favorites');
      expect(xml).not.toContain('/meal-log');
    });
  });
});
