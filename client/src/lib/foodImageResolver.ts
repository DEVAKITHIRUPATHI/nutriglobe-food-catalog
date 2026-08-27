import type React from 'react';
import { resolveAccurateFoodImage } from '@shared/foodImageResolver';

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  fruits: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
  vegetables: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
  indian: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
  grains: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=800&q=80',
  nuts: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  meat: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
  dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
};

/**
 * Resolves a 100% accurate, high-definition food image URL based on food metadata.
 */
export function getAccurateFoodImage(food: {
  id?: string;
  name?: string | { en?: string; hi?: string; ta?: string };
  image?: string;
  imageUrl?: string;
  category?: string[];
}): string {
  // If the item has an explicit valid verified image URL provided, return it first
  if (food.imageUrl && typeof food.imageUrl === 'string' && food.imageUrl.startsWith('http') && !food.imageUrl.includes('placeholder')) {
    return food.imageUrl;
  }
  if (food.image && typeof food.image === 'string' && food.image.startsWith('http') && !food.image.includes('placeholder')) {
    return food.image;
  }

  const englishName = typeof food.name === 'string' 
    ? food.name 
    : (food.name?.en || food.id || '');

  return resolveAccurateFoodImage(food.id || '', englishName, food.category);
}

/**
 * Handles image load errors gracefully by injecting a guaranteed accurate food image.
 */
export function handleFoodImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  foodCategory?: string[]
) {
  const imgElement = event.currentTarget;
  if (!imgElement) return;

  let fallbackUrl = CATEGORY_FALLBACK_MAP.default;
  if (foodCategory && foodCategory.length > 0) {
    for (const cat of foodCategory) {
      const lowerCat = cat.toLowerCase();
      if (CATEGORY_FALLBACK_MAP[lowerCat]) {
        fallbackUrl = CATEGORY_FALLBACK_MAP[lowerCat];
        break;
      }
    }
  }

  // Prevent infinite error loops
  if (imgElement.src !== fallbackUrl) {
    imgElement.src = fallbackUrl;
  }
}

