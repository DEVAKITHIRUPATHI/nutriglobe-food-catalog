import { describe, it, expect } from 'vitest';
import {
  toCanonicalSlug,
  fromCanonicalSlug,
  getFoodCanonicalUrl,
  isValidFoodSlug,
  normalizeFoodSlug
} from '../shared/canonicalSlug';

describe('Canonical Slug Utility', () => {
  it('converts food IDs and complex names to clean URL-safe slugs', () => {
    expect(toCanonicalSlug('finger_millet_ragi')).toBe('finger-millet-ragi');
    expect(toCanonicalSlug('Turmeric (Curcuma longa)')).toBe('turmeric-curcuma-longa');
    expect(toCanonicalSlug('Brown Rice, Cooked')).toBe('brown-rice-cooked');
    expect(toCanonicalSlug('Grandma’s Special Oats!')).toBe('grandmas-special-oats');
  });

  it('handles empty, null, or undefined gracefully', () => {
    expect(toCanonicalSlug('')).toBe('');
    expect(toCanonicalSlug('   ')).toBe('');
    expect(fromCanonicalSlug('')).toBe('');
  });

  it('reverts canonical slugs to snake_case identifier keys', () => {
    expect(fromCanonicalSlug('finger-millet-ragi')).toBe('finger_millet_ragi');
    expect(fromCanonicalSlug('spinach')).toBe('spinach');
  });

  it('builds canonical URLs with custom base domains and default fallback', () => {
    const defaultUrl = getFoodCanonicalUrl('spinach');
    expect(defaultUrl).toContain('/food/spinach');

    const customUrl = getFoodCanonicalUrl('finger_millet_ragi', 'https://nutrifacts.app');
    expect(customUrl).toBe('https://nutrifacts.app/food/finger-millet-ragi');
  });

  it('validates canonical slugs correctly', () => {
    expect(isValidFoodSlug('apple')).toBe(true);
    expect(isValidFoodSlug('brown-rice-cooked')).toBe(true);
    expect(isValidFoodSlug('finger-millet-ragi-123')).toBe(true);

    expect(isValidFoodSlug('Apple')).toBe(false);
    expect(isValidFoodSlug('apple_pie')).toBe(false);
    expect(isValidFoodSlug('apple pie')).toBe(false);
    expect(isValidFoodSlug('-apple-')).toBe(false);
    expect(isValidFoodSlug('')).toBe(false);
  });

  it('normalizes slugs', () => {
    expect(normalizeFoodSlug('Apple Pie With Cinnamon')).toBe('apple-pie-with-cinnamon');
  });
});
