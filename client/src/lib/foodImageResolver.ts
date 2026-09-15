import type React from 'react';
import { resolveAccurateFoodImage } from '@shared/foodImageResolver';
import type { ImageStatus } from '@shared/schema';

/**
 * Resolves a 100% accurate, high-definition food image URL based on food metadata.
 * Strictly adheres to Frontend Safety Rules (Requirement 17 & 18):
 * - If status is REJECTED or MISSING, returns empty string.
 * - Never returns a generic category fallback image.
 * - Accuracy is strictly prioritized over showing any image.
 */
export function getAccurateFoodImage(food: {
  id?: string;
  name?: string | { en?: string; hi?: string; ta?: string };
  image?: string;
  imageUrl?: string;
  image_url?: string;
  image_status?: ImageStatus;
  imageStatus?: ImageStatus;
  category?: string[];
}, isAdminReview: boolean = false): string {
  const status = food.image_status || food.imageStatus;

  // Never display rejected images to anyone
  if (status === 'REJECTED') {
    return '';
  }

  // If status is MISSING, do not render any generic image
  if (status === 'MISSING') {
    return '';
  }

  // If status is NEEDS_REVIEW, only render in admin review mode
  if (status === 'NEEDS_REVIEW' && !isAdminReview) {
    return '';
  }

  // If status is DUPLICATE, do not render publicly
  if (status === 'DUPLICATE' && !isAdminReview) {
    return '';
  }

  const rawUrl = food.image_url || food.imageUrl || food.image;
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('http') && !rawUrl.includes('placeholder') && !rawUrl.includes('source.unsplash.com')) {
    return rawUrl;
  }

  const englishName = typeof food.name === 'string' 
    ? food.name 
    : (food.name?.en || food.id || '');

  return resolveAccurateFoodImage(food.id || '', englishName, food.category);
}

/**
 * Handles image load errors gracefully by hiding failed broken images
 * rather than substituting with an unrelated stock photo (Requirement 18).
 */
export function handleFoodImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  _category?: string[] | string
) {
  const imgElement = event.currentTarget;
  if (!imgElement) return;

  // Mark as failed and hide to display the clean "Image unavailable" state
  imgElement.style.display = 'none';
  const parent = imgElement.parentElement;
  if (parent) {
    parent.setAttribute('data-image-error', 'true');
  }
}

export {
  getGoogleImageSearchUrl,
  getExcelHyperlinkFormula,
  autoCheckFoodAccuracy,
  auditAndFixFoodItemImage,
  resolveAccurateFoodImage,
  getFoodImageMetadata
} from '@shared/foodImageResolver';

export { ImageValidator, type ImageValidationResult } from './imageValidator';

