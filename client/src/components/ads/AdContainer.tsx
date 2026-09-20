import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, ExternalLink, Tag, Info, AlertCircle, Scale, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type AdType = 'adsense' | 'amazon' | 'flipkart' | 'auto' | 'google' | 'partner-tabs' | 'dual-partner';
export type AdPlacement = 'in-grid' | 'detail' | 'banner';

export interface AdContainerProps {
  /** Type of ad network: 'adsense', 'amazon', 'flipkart', or 'auto' */
  type?: AdType;
  /** Backwards compatibility alias for type */
  slotType?: AdType;
  /** Layout placement: 'in-grid', 'banner', or 'detail' */
  placement?: AdPlacement;
  /** AdSense ad unit slot ID */
  adSlot?: string;
  /** AdSense publisher client ID (ca-pub-...) */
  publisherClient?: string;
  /** Optional index when used in repetitive loops */
  index?: number;
  /** Food name for contextual partner queries */
  foodName?: string;
  /** Food category for contextual partner queries */
  category?: string;
  /** Extra CSS classes */
  className?: string;
  /** Whether to gracefully collapse to 0-height / null if ad fails or is blocked */
  collapseOnError?: boolean;
  /** Fallback mode on failure: 'collapse' removes from grid without gaps, 'placeholder' displays neutral sponsor card */
  fallbackMode?: 'collapse' | 'placeholder';
}

/**
 * NeutralAdPlaceholder
 * Clean, high-contrast, policy-compliant neutral sponsor card designed to match
 * FoodCard dimensions and aesthetics, preventing any broken layout gaps across all viewports (320px to 1440px).
 */
export const NeutralAdPlaceholder: React.FC<{
  foodName?: string;
  category?: string;
  className?: string;
}> = ({ foodName, category, className = '' }) => {
  const amazonQuery = encodeURIComponent(
    foodName ? `${foodName} kitchen food scale prep` : (category || 'digital food scale nutrition')
  );
  const sponsorUrl = `https://www.amazon.com/s?k=${amazonQuery}&tag=nutriglobe20-20`;

  return (
    <aside
      role="region"
      aria-label="Sponsored Partner Space"
      className={`group relative overflow-hidden col-span-1 h-full min-h-[380px] w-full max-w-full min-w-0 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-2xl p-4 sm:p-5 pt-5 sm:pt-6 transition-all duration-300 shadow-xs hover:shadow-md ${className}`}
    >
      {/* Top Colorful Gradient Edge Line matching FoodCard */}
      <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 via-sky-500 to-amber-500" />

      {/* Header with clear regulatory sponsor disclosure */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 truncate">
            Sponsored Partner
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 shrink-0">
          Verified Space
        </span>
      </div>

      {/* Body with contextual recommendations */}
      <div className="my-auto py-4 flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-105 transition-transform">
          <Scale className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-[240px]">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
            {foodName ? `Kitchen Scales & Prep Tools for ${foodName}` : 'Precision Nutrition Scales & Calorie Tracking Tools'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            Calibrated gram scales, portion bowls, and food prep accessories for daily nutrition.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">Portion Control &amp; Macro Tracking</span>
        </div>
      </div>

      {/* Action Button & Disclosure */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <a
          href={sponsorUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full"
        >
          <Button
            variant="outline"
            className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border-emerald-600 shadow-xs gap-1.5 justify-center hover:shadow-sm transition-all"
          >
            <span>Explore Kitchen Scales</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </Button>
        </a>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center leading-tight">
          Sponsored space • Independent of NutriFacts food database
        </p>
      </div>
    </aside>
  );
};

/**
 * AdContainer
 * Standardized, fully responsive ad container component supporting Google AdSense,
 * Amazon Associates, and Flipkart Affiliate links.
 * 
 * Features:
 * - Robust runtime checks: immediate ad-blocker detection, network checks, and unfilled ad handlers.
 * - Defensive failure behavior: completely collapses to 0 height (returning null) or renders a neutral sponsor placeholder.
 * - Prevents layout gaps: ensures CSS Grid flows uninterrupted across all screen sizes (320px to 1440px).
 * - Mandatory regulatory disclosures ('Advertisement', 'Sponsored (paid link)', Amazon Associate notice).
 * - Accessible with proper ARIA regions, landmarks, and semantic tags.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  type,
  slotType,
  placement = 'banner',
  adSlot = '1002003004',
  publisherClient = 'ca-pub-4353689996620152',
  index = 0,
  foodName,
  category,
  className = '',
  collapseOnError = true,
  fallbackMode = 'collapse',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isFailed, setIsFailed] = useState(() => {
    // Immediate pre-flight check on client: if offline, treat as failed immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return false;
  });
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);

  // Normalize type prop (support both 'type' and 'slotType')
  const resolvedType = React.useMemo<AdType>(() => {
    const rawType = type || slotType || 'adsense';
    if (rawType === 'google') return 'adsense';
    if (rawType === 'auto') {
      if (placement === 'in-grid') {
        // By default prioritize AdSense in-grid, or rotate smoothly every 16 items
        const cycle = Math.floor(index / 16) % 3;
        if (cycle === 0) return 'adsense';
        if (cycle === 1) return 'amazon';
        return 'flipkart';
      }
      return 'adsense';
    }
    return rawType;
  }, [type, slotType, placement, index]);

  // Defensive Google AdSense initialization & Ad-Blocker detection
  useEffect(() => {
    if (typeof window === 'undefined' || resolvedType !== 'adsense' || !publisherClient) {
      return;
    }

    let isPushed = false;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    // Check if AdSense script is present or blocked
    const checkScriptHealth = () => {
      try {
        const adsWindow = window as any;
        const scriptTag = document.querySelector('script[src*="adsbygoogle.js"]');
        if (!adsWindow.adsbygoogle && !scriptTag) {
          setIsAdBlockDetected(true);
          if (collapseOnError) setIsFailed(true);
        }
      } catch (e) {
        setIsFailed(true);
      }
    };

    const attemptPush = () => {
      if (isPushed || typeof window === 'undefined') return;

      const targetEl = containerRef.current || insRef.current;
      const elWidth = targetEl ? (targetEl.offsetWidth || targetEl.parentElement?.offsetWidth || 0) : 0;

      // Ensure container has rendered with measurable width before pushing to AdSense queue
      if (elWidth >= 180) {
        try {
          const adsWindow = window as any;
          adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
          adsWindow.adsbygoogle.push({});
          isPushed = true;
          // Note: Ad is not yet loaded, it will be observed via MutationObserver / timeout
        } catch (err) {
          // AdSense push rejected (ad blocker, duplicate slot, or CSP block)
          setIsFailed(true);
          setIsAdBlockDetected(true);
        }
      }
    };

    // Initial check
    checkScriptHealth();

    // Small delay to allow container DOM layout calculation
    const timer = setTimeout(attemptPush, 200);

    // Watch for container resize if initially hidden or 0-width
    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width >= 180 && !isPushed) {
            attemptPush();
            if (isPushed && observer) {
              observer.disconnect();
            }
          }
        }
      });
      observer.observe(containerRef.current);
    }

    // Observe ins element for status changes (e.g. data-ad-status="unfilled" / "filled", or iframe child insertion)
    let mutationObserver: MutationObserver | null = null;
    if (insRef.current && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver((mutations) => {
        const insEl = insRef.current;
        if (!insEl) return;

        const status = insEl.getAttribute('data-ad-status');
        if (status === 'unfilled') {
          setIsFailed(true);
        } else if (status === 'filled') {
          setIsAdLoaded(true);
        }

        // Check if an iframe child has been injected by Google
        if (insEl.querySelector('iframe')) {
          setIsAdLoaded(true);
        }
      });

      mutationObserver.observe(insRef.current, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
        childList: true,
        subtree: true,
      });
    }

    // Safety timeout: after 1800ms, if no iframe or visible ad exists, mark as failed to prevent layout gap
    fallbackTimeout = setTimeout(() => {
      const insEl = insRef.current;
      if (insEl) {
        const hasIframe = !!insEl.querySelector('iframe');
        const status = insEl.getAttribute('data-ad-status');
        const hasContent = hasIframe || insEl.clientHeight > 40;

        if (status === 'unfilled' || !hasContent) {
          setIsFailed(true);
        } else {
          setIsAdLoaded(true);
        }
      } else {
        setIsFailed(true);
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [resolvedType, publisherClient, collapseOnError]);

  // Contextual URLs for affiliate partners
  const amazonQuery = encodeURIComponent(
    foodName ? `${foodName} kitchen scale prep` : (category || 'digital food scale nutrition')
  );
  const amazonUrl = `https://www.amazon.com/s?k=${amazonQuery}&tag=nutriglobe20-20`;

  const flipkartQuery = encodeURIComponent(
    foodName ? `${foodName} organic grocery` : (category || 'kitchen scale food')
  );
  const flipkartUrl = `https://www.flipkart.com/search?q=${flipkartQuery}&affid=nutriglobe`;

  // Graceful failure handling: either collapse height completely to null or show neutral placeholder
  if (resolvedType === 'adsense' && (isFailed || isAdBlockDetected)) {
    if (fallbackMode === 'placeholder') {
      return (
        <NeutralAdPlaceholder
          foodName={foodName}
          category={category}
          className={className}
        />
      );
    }

    if (collapseOnError) {
      // Graceful collapse: returning null completely removes the element from the CSS Grid DOM,
      // which eliminates any empty grid track or cell, preventing any layout gaps across all viewports.
      return null;
    }
  }

  // =========================================================================
  // 1. IN-GRID PLACEMENT (Between Food Cards in Listing Grids)
  // =========================================================================
  if (placement === 'in-grid') {
    // A. Google AdSense in-grid unit
    if (resolvedType === 'adsense') {
      return (
        <aside
          ref={containerRef}
          role="region"
          aria-label="Advertisement"
          className={`col-span-1 h-full min-h-[380px] w-full max-w-full min-w-0 flex flex-col justify-between bg-slate-50/95 dark:bg-slate-900/90 border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 rounded-2xl p-4 transition-all shadow-xs ${className}`}
        >
          {/* Neutral Ad Header with mandatory 'Advertisement' label */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-700/70">
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
              Advertisement
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Google Ad
            </span>
          </div>

          {/* Ad Slot Content Area */}
          <div className="my-auto flex-1 flex flex-col items-center justify-center min-h-[220px] w-full py-2">
            <ins
              ref={insRef}
              className="adsbygoogle block w-full text-center"
              style={{ display: 'block', minHeight: '200px', width: '100%' }}
              data-ad-client={publisherClient}
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            {!isAdLoaded && !isFailed && (
              <div className="text-center p-4 text-xs text-slate-400 animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 mr-2" />
                Loading advertisement...
              </div>
            )}
          </div>

          {/* Neutral Separator Footer */}
          <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/70 text-[9px] text-slate-400 dark:text-slate-500 text-center leading-tight">
            Sponsored space • Separated from NutriFacts food database
          </div>
        </aside>
      );
    }

    // B. Amazon in-grid unit
    if (resolvedType === 'amazon') {
      return (
        <aside
          ref={containerRef}
          role="region"
          aria-label="Sponsored Content"
          className={`col-span-1 h-full min-h-[380px] w-full max-w-full min-w-0 flex flex-col justify-between bg-white dark:bg-slate-900 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all ${className}`}
        >
          {/* Header with mandatory 'Sponsored' label */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1 truncate">
              <Tag className="w-3 h-3 shrink-0" /> Sponsored (paid link)
            </span>
            <span className="text-[9px] text-slate-400 font-medium shrink-0">Amazon</span>
          </div>

          {/* Body */}
          <div className="my-auto py-3 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {foodName ? `Kitchen Scales for ${foodName}` : 'Digital Food Scales & Meal Prep Tools'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore food scales and kitchen essentials on Amazon.
              </p>
            </div>
          </div>

          {/* Action & Statutory Amazon Disclosure */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl border-amber-600/40 gap-1.5 justify-center"
              >
                <span>View current offer on Amazon</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Button>
            </a>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center leading-tight">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </div>
        </aside>
      );
    }

    // C. Flipkart in-grid unit
    return (
      <aside
        ref={containerRef}
        role="region"
        aria-label="Sponsored Content"
        className={`col-span-1 h-full min-h-[380px] w-full max-w-full min-w-0 flex flex-col justify-between bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all ${className}`}
      >
        {/* Header with mandatory 'Sponsored' label */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1 truncate">
            <Tag className="w-3 h-3 shrink-0" /> Sponsored / Affiliate
          </span>
          <span className="text-[9px] text-slate-400 font-medium shrink-0">Flipkart</span>
        </div>

        {/* Body */}
        <div className="my-auto py-3 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {foodName ? `Pantry Staples for ${foodName}` : 'Flipkart Grocery & Kitchen Essentials'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore organic staples, grains, and kitchen tools on Flipkart.
            </p>
          </div>
        </div>

        {/* Action & Disclosure */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={flipkartUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full"
          >
            <Button
              variant="outline"
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border-blue-700 gap-1.5 justify-center"
            >
              <span>View current offer on Flipkart</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Button>
          </a>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center leading-tight">
            Affiliate partner link. Check offer and pricing on Flipkart.
          </p>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 2. DETAIL PAGE TABBED PLACEMENT
  // =========================================================================
  if (placement === 'detail' || resolvedType === 'partner-tabs') {
    return (
      <section
        role="region"
        aria-label="Sponsored Partner Links"
        className={`my-6 space-y-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 md:p-5 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Partner & Equipment Links
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold">
              Sponsored
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Outbound partner links do not affect independent nutritional data
          </span>
        </div>

        <Tabs defaultValue="amazon" className="w-full">
          <TabsList className="grid grid-cols-3 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl max-w-sm">
            <TabsTrigger value="amazon" className="text-xs font-bold py-1.5 rounded-lg">
              Amazon
            </TabsTrigger>
            <TabsTrigger value="flipkart" className="text-xs font-bold py-1.5 rounded-lg">
              Flipkart
            </TabsTrigger>
            <TabsTrigger value="adsense" className="text-xs font-bold py-1.5 rounded-lg">
              AdSense
            </TabsTrigger>
          </TabsList>

          {/* Amazon Tab */}
          <TabsContent value="amazon" className="mt-3 focus-visible:outline-none">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Sponsored (paid link)
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {foodName ? `Kitchen scales & meal prep tools for ${foodName}` : 'Digital Food Scales & Calorie Portions'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Find calibrated kitchen tools, measuring cups, and food scales on Amazon.
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl h-9 gap-1.5">
                    <span>View current offer on Amazon</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 italic">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </TabsContent>

          {/* Flipkart Tab */}
          <TabsContent value="flipkart" className="mt-3 focus-visible:outline-none">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Sponsored / Affiliate Link
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {foodName ? `Organic staples & grocery pairings for ${foodName}` : 'Flipkart Supermart Grocery & Kitchen Tools'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore unpolished grains, pure cold-pressed oils, and kitchen appliances.
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
                <a
                  href={flipkartUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-9 gap-1.5">
                    <span>View current offer on Flipkart</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 italic">
              Affiliate partner link. Check offer and pricing on Flipkart.
            </p>
          </TabsContent>

          {/* AdSense Tab */}
          <TabsContent value="adsense" className="mt-3 focus-visible:outline-none">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                Advertisement
              </div>
              <ins
                className="adsbygoogle block w-full text-center"
                style={{ display: 'block', minHeight: '90px' }}
                data-ad-client={publisherClient}
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    );
  }

  // =========================================================================
  // 3. DUAL-PARTNER SIDE-BY-SIDE FORMAT
  // =========================================================================
  if (resolvedType === 'dual-partner') {
    return (
      <section
        role="region"
        aria-label="Sponsored Partner Deals"
        className={`my-6 space-y-3 ${className}`}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Partner Affiliate Links
          </span>
          <span className="text-[10px] text-slate-400">Paid Links</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amazon Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Sponsored (paid link)
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                {foodName ? `Amazon Kitchen Tools for ${foodName}` : 'Digital Food Scales & Portioning Tools'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore kitchen accessories and scales on Amazon.
              </p>
            </div>
            <div>
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl border-amber-600/40 gap-1.5 justify-center"
                >
                  <span>View current offer on Amazon</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Button>
              </a>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-1.5 leading-tight">
                As an Amazon Associate I earn from qualifying purchases.
              </p>
            </div>
          </div>

          {/* Flipkart Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Sponsored / Affiliate
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                {foodName ? `Flipkart Supermart Staples for ${foodName}` : 'Flipkart Grocery & Kitchen Essentials'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore pantry items, whole grains, and accessories on Flipkart.
              </p>
            </div>
            <div>
              <a
                href={flipkartUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border-blue-700 gap-1.5 justify-center"
                >
                  <span>View current offer on Flipkart</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Button>
              </a>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-1.5 leading-tight">
                Affiliate link. Check offer and pricing on Flipkart.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 4. STANDARD HORIZONTAL BANNER (Google AdSense)
  // =========================================================================
  if (isFailed || isAdBlockDetected) {
    if (fallbackMode === 'collapse') {
      return null;
    }
  }

  return (
    <aside
      ref={containerRef}
      role="region"
      aria-label="Advertisement"
      className={`my-6 mx-auto w-full min-w-[250px] max-w-5xl text-center overflow-hidden ${className}`}
    >
      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
        Advertisement
      </div>
      <ins
        ref={insRef}
        className="adsbygoogle block w-full min-h-[90px]"
        style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
        data-ad-client={publisherClient}
        data-ad-slot={adSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </aside>
  );
};
