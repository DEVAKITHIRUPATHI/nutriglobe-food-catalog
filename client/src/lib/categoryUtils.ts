import type { FoodItemClient } from '@shared/schema';

/**
 * Checks if a food item matches the given filter category.
 * Supports primary categories (fruits, vegetables, grains, etc.)
 * as well as regional, dietary, nutritional, health goals, allergens, preparation, and meal categories.
 */
export function matchesCategory(item: FoodItemClient, category: string): boolean {
  if (!category || category === 'all') return true;

  const targetCat = category.toLowerCase().trim();
  const itemCats = (item.category || []).map(c => String(c).toLowerCase());
  const origin = (item.origin || '').toLowerCase();
  const nameEn = (item.name?.en || '').toLowerCase();
  const descEn = (item.description?.en || '').toLowerCase();

  // 1. Direct array match or exact category inclusion
  if (itemCats.includes(targetCat) || itemCats.some(c => c.includes(targetCat) || targetCat.includes(c))) {
    return true;
  }

  // 2. Food Types Mapping (🍎 Food Types)
  if (targetCat === 'fruits') return itemCats.includes('fruits') || itemCats.includes('fruit');
  if (targetCat === 'vegetables') return itemCats.includes('vegetables') || itemCats.includes('vegetable');
  if (targetCat === 'grains') return itemCats.includes('grains') || itemCats.includes('grain') || itemCats.includes('cereals');
  if (targetCat === 'spices') return itemCats.includes('spices') || itemCats.includes('spice') || itemCats.includes('herbs');
  if (targetCat === 'dairy') return itemCats.includes('dairy') || itemCats.includes('milk');
  if (targetCat === 'seafood') return itemCats.includes('seafood') || itemCats.includes('fish');
  if (targetCat === 'meat') return itemCats.includes('meat') || itemCats.includes('beef') || itemCats.includes('pork') || itemCats.includes('lamb');
  if (targetCat === 'poultry') return itemCats.includes('poultry') || itemCats.includes('chicken') || itemCats.includes('turkey');
  if (targetCat === 'nuts') return itemCats.includes('nuts') || itemCats.includes('nut');
  if (targetCat === 'seeds') return itemCats.includes('seeds') || itemCats.includes('seed');
  if (targetCat === 'legumes') return itemCats.includes('legumes') || itemCats.includes('pulses') || itemCats.includes('beans') || itemCats.includes('lentils');

  // 3. Regional Categories (🌍 Regional)
  if (targetCat === 'indian') {
    return origin.includes('india') || origin.includes('tamil') || origin.includes('kerala') || origin.includes('punjab') || origin.includes('bengal') || itemCats.includes('indian');
  }
  if (targetCat === 'asian') {
    return origin.includes('asia') || origin.includes('china') || origin.includes('japan') || origin.includes('korea') || origin.includes('thailand') || origin.includes('vietnam') || origin.includes('india') || itemCats.includes('asian');
  }
  if (targetCat === 'mediterranean') {
    return origin.includes('mediterranean') || origin.includes('greece') || origin.includes('italy') || origin.includes('spain') || origin.includes('turkey') || origin.includes('egypt') || itemCats.includes('mediterranean');
  }
  if (targetCat === 'european') {
    return origin.includes('europe') || origin.includes('france') || origin.includes('germany') || origin.includes('italy') || origin.includes('uk') || origin.includes('spain') || itemCats.includes('european');
  }
  if (targetCat === 'american') {
    return origin.includes('america') || origin.includes('usa') || origin.includes('mexico') || origin.includes('canada') || origin.includes('brazil') || itemCats.includes('american');
  }

  // 4. Dietary Categories (🌿 Dietary)
  if (targetCat === 'vegan') {
    return itemCats.includes('vegan') || itemCats.includes('fruits') || itemCats.includes('vegetables') || itemCats.includes('grains') || itemCats.includes('spices') || itemCats.includes('nuts') || itemCats.includes('seeds') || itemCats.includes('legumes');
  }
  if (targetCat === 'vegetarian') {
    return !itemCats.includes('seafood') && !itemCats.includes('meat') && !itemCats.includes('poultry');
  }
  if (targetCat === 'gluten-free' || targetCat === 'gluten_free') {
    return itemCats.includes('gluten-free') || itemCats.includes('fruits') || itemCats.includes('vegetables') || itemCats.includes('nuts') || itemCats.includes('seeds') || itemCats.includes('legumes') || itemCats.includes('dairy');
  }
  if (targetCat === 'keto') {
    const carbs = item.nutrition?.carbs ?? 100;
    return carbs <= 12 || itemCats.includes('keto') || itemCats.includes('nuts') || itemCats.includes('seeds') || itemCats.includes('seafood') || itemCats.includes('meat');
  }

  // 5. Nutritional Categories (🧬 Nutritional)
  if (targetCat === 'high_protein' || targetCat === 'high-protein') {
    const protein = item.nutrition?.protein ?? 0;
    return protein >= 6 || itemCats.includes('high_protein') || itemCats.includes('meat') || itemCats.includes('poultry') || itemCats.includes('seafood') || itemCats.includes('legumes') || itemCats.includes('nuts');
  }
  if (targetCat === 'high_fiber' || targetCat === 'high-fiber') {
    const fiber = item.nutrition?.fiber ?? 0;
    return fiber >= 3 || itemCats.includes('high_fiber') || itemCats.includes('grains') || itemCats.includes('legumes') || itemCats.includes('nuts') || itemCats.includes('seeds') || itemCats.includes('vegetables');
  }
  if (targetCat === 'high_iron' || targetCat === 'high-iron') {
    const iron = item.nutrition?.iron ?? 0;
    return iron >= 0.8 || itemCats.includes('high_iron') || itemCats.includes('spices') || itemCats.includes('legumes') || itemCats.includes('seeds') || itemCats.includes('grains');
  }
  if (targetCat === 'high_vitamin_c' || targetCat === 'high-vitamin-c') {
    const vitC = item.nutrition?.vitaminC ?? 0;
    return vitC >= 8 || itemCats.includes('high_vitamin_c') || itemCats.includes('fruits') || itemCats.includes('vegetables');
  }

  // 6. Health Goals (❤️ Health Goals)
  if (targetCat === 'muscle' || targetCat === 'muscle_recovery') {
    const protein = item.nutrition?.protein ?? 0;
    return protein >= 6 || itemCats.includes('meat') || itemCats.includes('poultry') || itemCats.includes('seafood') || itemCats.includes('legumes') || itemCats.includes('dairy');
  }
  if (targetCat === 'immunity' || targetCat === 'immunity_boost') {
    const vitC = item.nutrition?.vitaminC ?? 0;
    return vitC >= 8 || itemCats.includes('fruits') || itemCats.includes('vegetables') || itemCats.includes('spices');
  }
  if (targetCat === 'gut' || targetCat === 'gut_health') {
    const fiber = item.nutrition?.fiber ?? 0;
    return fiber >= 2.5 || itemCats.includes('grains') || itemCats.includes('legumes') || itemCats.includes('fruits') || itemCats.includes('vegetables');
  }
  if (targetCat === 'energy' || targetCat === 'energy_support') {
    const carbs = item.nutrition?.carbs ?? 0;
    const iron = item.nutrition?.iron ?? 0;
    return carbs >= 15 || iron >= 1.0 || itemCats.includes('grains') || itemCats.includes('nuts') || itemCats.includes('seeds');
  }

  // 7. Allergens (⚠️ Allergens)
  if (targetCat === 'dairy-free' || targetCat === 'dairy_free') {
    return !itemCats.includes('dairy');
  }
  if (targetCat === 'nut-free' || targetCat === 'nut_free') {
    return !itemCats.includes('nuts') && !itemCats.includes('nut');
  }
  if (targetCat === 'soy-free' || targetCat === 'soy_free') {
    return !nameEn.includes('soy') && !descEn.includes('soy');
  }

  // 8. Preparation (🍳 Preparation)
  if (targetCat === 'raw' || targetCat === 'raw_fresh') {
    return itemCats.includes('fruits') || itemCats.includes('nuts') || itemCats.includes('seeds') || nameEn.includes('fresh') || descEn.includes('raw');
  }
  if (targetCat === 'boiled' || targetCat === 'steamed') {
    return itemCats.includes('grains') || itemCats.includes('legumes') || itemCats.includes('vegetables') || descEn.includes('boil') || descEn.includes('steam');
  }
  if (targetCat === 'dried' || targetCat === 'ground') {
    return itemCats.includes('spices') || itemCats.includes('nuts') || itemCats.includes('seeds') || descEn.includes('dry') || descEn.includes('ground');
  }
  if (targetCat === 'fermented') {
    return itemCats.includes('dairy') || nameEn.includes('curd') || nameEn.includes('yogurt') || nameEn.includes('kimchi') || descEn.includes('fermented');
  }

  // 9. Meals (🍽️ Meals)
  if (targetCat === 'breakfast') {
    return itemCats.includes('fruits') || itemCats.includes('dairy') || itemCats.includes('grains') || nameEn.includes('smoothie') || nameEn.includes('oats') || nameEn.includes('toast');
  }
  if (targetCat === 'lunch') {
    return itemCats.includes('grains') || itemCats.includes('legumes') || itemCats.includes('vegetables') || itemCats.includes('poultry') || itemCats.includes('meat') || itemCats.includes('seafood');
  }
  if (targetCat === 'snack' || targetCat === 'snacks') {
    return itemCats.includes('nuts') || itemCats.includes('seeds') || itemCats.includes('fruits') || nameEn.includes('snack') || nameEn.includes('bar');
  }
  if (targetCat === 'dinner') {
    return itemCats.includes('vegetables') || itemCats.includes('grains') || itemCats.includes('legumes') || itemCats.includes('meat') || itemCats.includes('poultry') || itemCats.includes('seafood');
  }

  // Fallback Name / Description Match
  return nameEn.includes(targetCat) || descEn.includes(targetCat);
}

/**
 * Sorts food items in A-to-Z alphabetical order by English name
 */
export function sortFoodsAToZ(foods: FoodItemClient[]): FoodItemClient[] {
  return [...foods].sort((a, b) => {
    const nameA = (a.name?.en || '').trim();
    const nameB = (b.name?.en || '').trim();
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
  });
}
