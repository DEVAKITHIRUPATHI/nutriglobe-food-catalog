import React from 'react';
import { AdContainer } from './AdContainer';

interface FoodItemPartnerAdsProps {
  foodName?: string;
  category?: string;
  className?: string;
  defaultTab?: 'amazon' | 'flipkart' | 'google';
}

/**
 * FoodItemPartnerAds
 * Delivers Google Ads space, Amazon Affiliate space, and Flipkart Affiliate space
 * on each food item page/modal without disturbing clinical reading experience.
 * Powered by policy-compliant AdContainer.
 */
export function FoodItemPartnerAds({
  foodName,
  category,
  className = '',
  defaultTab = 'amazon'
}: FoodItemPartnerAdsProps) {
  return (
    <AdContainer
      placement="detail"
      slotType="partner-tabs"
      foodName={foodName}
      category={category}
      className={className}
    />
  );
}

