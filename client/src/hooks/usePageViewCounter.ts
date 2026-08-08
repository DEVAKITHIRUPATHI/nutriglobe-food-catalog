import { useEffect } from 'react';

export interface FoodViewOptions {
  foodId?: string;
  foodName?: string;
  category?: string;
}

/**
 * Custom hook to increment page-specific view counters and food-specific view counters
 * in the database on every component mount.
 */
export function usePageViewCounter(
  path?: string, 
  pageName?: string, 
  foodData?: FoodViewOptions
) {
  useEffect(() => {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // 1. Increment page-specific view counter in the database
    fetch('/api/analytics/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        path: currentPath,
        pageName: pageName || undefined 
      })
    }).catch((err) => {
      console.warn('Failed to increment page view counter:', err);
    });

    // 2. Increment food-specific view counter if viewing a food item
    if (foodData?.foodId) {
      fetch('/api/analytics/food-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: foodData.foodId,
          foodName: foodData.foodName || foodData.foodId,
          category: foodData.category || 'General'
        })
      }).catch((err) => {
        console.warn('Failed to increment food view counter:', err);
      });
    }
  }, [path, pageName, foodData?.foodId]);
}
