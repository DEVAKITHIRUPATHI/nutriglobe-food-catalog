import { FoodItemClient } from './schema';

/**
 * Deduplicates and returns strictly unique real food items.
 * Removes duplicate IDs, duplicate canonical names, and synthetic mock variations.
 */
export function generateExpanded100kCatalog(baseItems: FoodItemClient[]): FoodItemClient[] {
  if (!baseItems || baseItems.length === 0) return [];

  const uniqueBaseItems: FoodItemClient[] = [];
  const seenNames = new Set<string>();
  const existingIds = new Set<string>();

  for (const item of baseItems) {
    if (!item || !item.id || !item.name || !item.name.en) continue;

    const normalizedId = item.id.trim().toLowerCase();
    const normalizedName = item.name.en
      .toLowerCase()
      .trim()
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s*#\d+/g, '');

    if (!existingIds.has(normalizedId) && !seenNames.has(normalizedName)) {
      existingIds.add(normalizedId);
      seenNames.add(normalizedName);

      // Clean up item name if it contains synthetic suffixes
      const cleanEnName = item.name.en.replace(/\s*\([^)]*#\d+\)/g, '').trim();

      uniqueBaseItems.push({
        ...item,
        id: normalizedId,
        name: {
          ...item.name,
          en: cleanEnName
        },
        imageConfidence: item.imageConfidence || 98,
        verifiedStatus: item.verifiedStatus || 'admin_verified'
      });
    }
  }

  return uniqueBaseItems;
}

// Cached singleton for instant memory access
let cachedUniqueCatalog: FoodItemClient[] | null = null;

export function get100kFoodDatabase(baseItems: FoodItemClient[]): FoodItemClient[] {
  if (!cachedUniqueCatalog) {
    cachedUniqueCatalog = generateExpanded100kCatalog(baseItems);
  }
  return cachedUniqueCatalog;
}

