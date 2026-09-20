import React from 'react';
import { AdContainer, AdType } from './AdContainer';

export type InGridAdVariant = 'adsense' | 'auto' | 'amazon' | 'flipkart' | 'google';

export interface InGridAdCardProps {
  /** Google AdSense ad slot ID */
  slot?: string;
  /** Google AdSense publisher client ID (ca-pub-...) */
  client?: string;
  /** Ad variant: defaults to 'adsense' */
  variant?: InGridAdVariant;
  /** Index position within the grid */
  index?: number;
  /** Food name for contextual partner ads */
  foodName?: string;
  /** Food category for contextual recommendations */
  category?: string;
  /** Additional CSS class names */
  className?: string;
  /** Fallback mode if ad fails or is blocked: 'collapse' or 'placeholder' */
  fallbackMode?: 'collapse' | 'placeholder';
}

/**
 * InGridAdCard
 * 
 * Embeds non-disruptive, policy-compliant Google AdSense units directly inside
 * the food card grid.
 * 
 * Key Specifications:
 * - Layout Integrity: Sits safely within a single CSS grid cell without breaking columns.
 * - Visual Distinction: Features a neutral slate background and distinct dashed border to cleanly separate it from food cards.
 * - Clear Labeling: Displays mandatory 'Advertisement' header and separation disclaimer.
 * - Graceful Collapse: If ad blocking or initialization fails, collapses without leaving broken whitespace.
 */
export function InGridAdCard({
  slot = '5566778899',
  client = 'ca-pub-4353689996620152',
  variant = 'adsense',
  index = 0,
  foodName,
  category,
  className = '',
  fallbackMode = 'collapse',
}: InGridAdCardProps) {
  // Map variant to AdType supported by AdContainer
  const adType: AdType = variant === 'google' ? 'adsense' : (variant as AdType);

  return (
    <AdContainer
      type={adType}
      placement="in-grid"
      adSlot={slot}
      publisherClient={client}
      index={index}
      foodName={foodName}
      category={category}
      collapseOnError={true}
      fallbackMode={fallbackMode}
      className={className}
    />
  );
}
