/**
 * Canonical URL Slug Generator & Resolver for NutriFacts
 * Provides SEO-friendly, URL-safe canonical slugs and structured URLs
 * for all food catalog items, search routes, and SEO metadata.
 */

export const PRODUCTION_DOMAIN = 'https://www.nutrifacts.fun';

/**
 * Common canonical slug shortcuts / aliases mapped directly to database record keys.
 * Ensures clean, short, memorable canonical URLs for staple foods.
 */
export const CANONICAL_SLUG_ALIASES: Record<string, string> = {
  'apple': 'fuji_apple',
  'apples': 'fuji_apple',
  'banana': 'banana',
  'bananas': 'banana',
  'coconut': 'coconut_mature',
  'coconuts': 'coconut_mature',
  'tender-coconut': 'tender_coconut',
  'tender-coconuts': 'tender_coconut',
  'dragon-fruit': 'dragon_fruit',
  'nungu': 'nungu_ice_apple',
  'ragi': 'finger_millet_ragi',
  'finger-millet': 'finger_millet_ragi',
  'turmeric': 'turmeric_curcuma_longa',
  'spinach': 'spinach',
};

/**
 * Converts a food item ID or name into an SEO-friendly canonical slug.
 * Example: 'finger_millet_ragi' -> 'finger-millet-ragi'
 * Example: 'Turmeric (Curcuma longa)' -> 'turmeric-curcuma-longa'
 */
export function toCanonicalSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a URL slug or identifier candidate to its corresponding database item ID.
 */
export function resolveCanonicalFoodId(slugOrId: string): string {
  if (!slugOrId) return '';
  const clean = slugOrId.toLowerCase().trim();
  if (CANONICAL_SLUG_ALIASES[clean]) {
    return CANONICAL_SLUG_ALIASES[clean];
  }
  const kebab = toCanonicalSlug(clean);
  if (CANONICAL_SLUG_ALIASES[kebab]) {
    return CANONICAL_SLUG_ALIASES[kebab];
  }
  return clean.replace(/-/g, '_');
}

/**
 * Reverts a canonical slug back to an internal snake_case identifier candidate.
 * Example: 'finger-millet-ragi' -> 'finger_millet_ragi'
 */
export function fromCanonicalSlug(slug: string): string {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .trim()
    .replace(/-/g, '_');
}

/**
 * Builds the canonical public URL for a food record given its ID or slug.
 */
export function getFoodCanonicalUrl(foodIdOrSlug: string, baseUrl?: string): string {
  const slug = toCanonicalSlug(foodIdOrSlug);
  const domain = baseUrl 
    ? baseUrl.replace(/\/+$/, '') 
    : (typeof window !== 'undefined' && window.location.origin.includes('nutrifacts.fun')
        ? window.location.origin 
        : PRODUCTION_DOMAIN);
  return `${domain}/food/${encodeURIComponent(slug)}`;
}

/**
 * Returns the definitive production canonical URL for SEO tags and sitemaps.
 */
export function getProductionCanonicalUrl(foodIdOrSlug: string): string {
  const slug = toCanonicalSlug(foodIdOrSlug);
  return `${PRODUCTION_DOMAIN}/food/${encodeURIComponent(slug)}`;
}

/**
 * Checks whether a given string is a valid canonical slug.
 */
export function isValidFoodSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

/**
 * Normalizes any slug string to standard lowercase kebab-case.
 */
export function normalizeFoodSlug(slug: string): string {
  return toCanonicalSlug(slug);
}

/**
 * Quality Gate validator: checks whether a food record meets technical
 * content quality standards to be indexed by Google and included in XML sitemaps.
 */
export function isFoodEligibleForIndexing(food: any): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!food) {
    return { eligible: false, reasons: ['Food record is null or undefined'] };
  }

  // 1. Food Name
  const foodName = typeof food.name === 'string' ? food.name : (food.name?.en || food.id);
  if (!foodName || foodName.trim().length === 0) {
    reasons.push('Missing food name');
  }

  // 2. Canonical Slug
  const slug = toCanonicalSlug(food.id);
  if (!slug || slug.length === 0) {
    reasons.push('Missing or invalid canonical slug');
  }

  // 3. Category
  const cat = Array.isArray(food.category) ? food.category[0] : food.category;
  if (!cat || typeof cat !== 'string' || cat.trim().length === 0) {
    reasons.push('Missing food category');
  }

  // 4. Valid Image
  const img = food.image || food.imageUrl;
  if (!img || typeof img !== 'string' || !img.startsWith('http') || img.includes('placeholder')) {
    reasons.push('Missing or invalid high-resolution food image');
  }

  // 5. Nutrition Data
  if (!food.nutrition || typeof food.nutrition.calories !== 'number') {
    reasons.push('Missing mandatory macronutrient calorie data');
  }

  // 6. Meaningful Description (No Lorem Ipsum or thin text)
  const desc = typeof food.description === 'string' ? food.description : (food.description?.en || '');
  if (!desc || desc.length < 15 || /lorem\s+ipsum/i.test(desc)) {
    reasons.push('Description is missing, too short (<15 chars), or contains placeholder text');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export default {
  PRODUCTION_DOMAIN,
  CANONICAL_SLUG_ALIASES,
  toCanonicalSlug,
  resolveCanonicalFoodId,
  fromCanonicalSlug,
  getFoodCanonicalUrl,
  getProductionCanonicalUrl,
  isValidFoodSlug,
  normalizeFoodSlug,
  isFoodEligibleForIndexing,
};
