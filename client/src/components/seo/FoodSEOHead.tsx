import React from 'react';
import type { FoodItemClient } from '@shared/schema';
import { useFoodSEO } from '@/hooks/useFoodSEO';

interface FoodSEOHeadProps {
  food: FoodItemClient | null | undefined;
  isActive?: boolean;
}

export function FoodSEOHead({ food, isActive = true }: FoodSEOHeadProps) {
  useFoodSEO(food, isActive);
  return null;
}
