import React, { useEffect, useRef } from 'react';
import { ShoppingBag, ExternalLink, Tag, Star, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlipkartAdBanner } from './FlipkartAdBanner';

export type InGridAdVariant = 'auto' | 'google' | 'amazon' | 'flipkart';

interface InGridAdCardProps {
  slot?: string;
  client?: string;
  variant?: InGridAdVariant;
  index?: number;
  className?: string;
}

export function InGridAdCard({
  slot = '5566778899',
  client = 'ca-pub-4353689996620152',
  variant = 'auto',
  index = 0,
  className = ''
}: InGridAdCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  // Compute resolved variant based on index if 'auto'
  const resolvedVariant: 'google' | 'amazon' | 'flipkart' = (() => {
    if (variant !== 'auto') return variant;
    const cycle = Math.floor(index / 8) % 3;
    if (cycle === 0) return 'amazon';
    if (cycle === 1) return 'flipkart';
    return 'google';
  })();

  useEffect(() => {
    if (resolvedVariant !== 'google' || !client || isLoadedRef.current) return;

    const tryPushAd = () => {
      if (isLoadedRef.current) return;
      const el = containerRef.current;
      const width = el ? el.offsetWidth || el.parentElement?.offsetWidth || 0 : 0;

      if (width >= 200 && window && (window as any).adsbygoogle) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          isLoadedRef.current = true;
        } catch (e) {
          // Deferred until Google AdSense script initializes
        }
      }
    };

    const timer = setTimeout(tryPushAd, 400);
    return () => clearTimeout(timer);
  }, [client, resolvedVariant]);

  // Variant 1: Flipkart Deal Card
  if (resolvedVariant === 'flipkart') {
    return (
      <div className={`col-span-1 h-full min-h-[360px] flex flex-col ${className}`}>
        <FlipkartAdBanner format="card" maxItems={1} />
      </div>
    );
  }

  // Variant 2: Amazon Affiliate Deal Card
  if (resolvedVariant === 'amazon') {
    return (
      <div 
        ref={containerRef}
        className={`relative overflow-hidden h-full min-h-[360px] flex flex-col bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all justify-between col-span-1 ${className}`}
      >
        {/* Ad Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Tag className="w-3 h-3" /> Amazon Choice
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Prime Delivery</span>
        </div>

        {/* Product Image */}
        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 my-1 group">
          <img 
            src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80" 
            alt="Digital Kitchen Scale" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            30% OFF
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 my-2">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
            Top Pick for Calorie & Macro Tracking
          </span>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
            Precision Digital Food Scale (0.1g Accuracy) for Healthy Portions
          </h4>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">$13.99</span>
            <span className="line-through text-slate-400 text-xs">$19.99</span>
            <div className="flex items-center text-amber-500 text-[11px] font-bold ml-auto">
              <Star className="w-3 h-3 fill-current mr-0.5" /> 4.8 (12k)
            </div>
          </div>
        </div>

        {/* Action */}
        <a 
          href="https://www.amazon.com/dp/B0113GAN44?tag=nutriglobe20-20" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 block"
        >
          <Button className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs gap-1.5 flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Check Deal on Amazon</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Button>
        </a>
      </div>
    );
  }

  // Variant 3: Google AdSense Native In-Feed Unit
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden h-full min-h-[360px] flex flex-col bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all justify-between col-span-1 ${className}`}
    >
      {/* Ad Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
          <Sparkles className="w-2.5 h-2.5" /> Google Ad
        </span>
        <span className="text-[10px] font-mono text-slate-400">{client}</span>
      </div>

      {/* AdSense In-Feed Responsive Unit */}
      <div className="w-full my-auto flex-1 flex flex-col items-center justify-center min-h-[160px] bg-white dark:bg-slate-850 rounded-xl p-2 border border-dashed border-slate-300 dark:border-slate-700">
        <ins
          className="adsbygoogle block w-full text-center min-h-[140px]"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
        />
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Personalized Google Healthy Living & Nutrition Ads
        </p>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Non-intrusive sponsor unit</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">NutriGlobe Certified</span>
      </div>
    </div>
  );
}
