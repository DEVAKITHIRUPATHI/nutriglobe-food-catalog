import React from 'react';
import { ShoppingBag, ExternalLink, Star, ShieldCheck, Tag, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

export interface FlipkartProduct {
  id: string;
  title: string;
  category: 'grocery' | 'kitchen' | 'wellness' | 'superfoods';
  rating: number;
  reviewsCount: number;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  flipkartAssured: boolean;
  imageUrl: string;
  flipkartUrl: string;
  highlightBadge?: string;
}

const FLIPKART_DEALS: FlipkartProduct[] = [
  {
    id: 'fk-scale-1',
    title: 'HealthSense Chef-Mate Digital Kitchen Weighing Scale (High Precision 1g to 5kg)',
    category: 'kitchen',
    rating: 4.6,
    reviewsCount: 38400,
    price: '₹799',
    originalPrice: '₹1,899',
    discountPercent: 57,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=digital+kitchen+weighing+scale&affid=nutriglobe',
    highlightBadge: 'Top Kitchen Scale'
  },
  {
    id: 'fk-millet-1',
    title: 'Organic Foxtail Millet (Kangni / Thinai) Unpolished 1kg - High Dietary Fiber & Low GI',
    category: 'superfoods',
    rating: 4.7,
    reviewsCount: 14200,
    price: '₹229',
    originalPrice: '₹349',
    discountPercent: 34,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=organic+foxtail+millet&affid=nutriglobe',
    highlightBadge: 'Flipkart Supermart Choice'
  },
  {
    id: 'fk-blender-1',
    title: 'Wonderchef Nutri-blend 400W Mixer Grinder & High-Speed Smoothie Blender (2 Jars)',
    category: 'kitchen',
    rating: 4.5,
    reviewsCount: 52100,
    price: '₹2,499',
    originalPrice: '₹4,500',
    discountPercent: 44,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=wonderchef+nutri+blend&affid=nutriglobe',
    highlightBadge: '#1 Bestseller Smoothie Maker'
  },
  {
    id: 'fk-oil-1',
    title: 'Cold-Pressed Virgin Coconut Oil 100% Raw & Pure (1 Litre Glass Bottle) - Keto Friendly',
    category: 'grocery',
    rating: 4.8,
    reviewsCount: 26800,
    price: '₹449',
    originalPrice: '₹650',
    discountPercent: 30,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=cold+pressed+virgin+coconut+oil&affid=nutriglobe',
    highlightBadge: '100% Cold-Pressed'
  },
  {
    id: 'fk-almonds-1',
    title: 'Happilo Premium 100% Natural California Almonds (500g Value Pack) - Rich in Vit E',
    category: 'grocery',
    rating: 4.7,
    reviewsCount: 89000,
    price: '₹429',
    originalPrice: '₹625',
    discountPercent: 31,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=happilo+california+almonds&affid=nutriglobe',
    highlightBadge: 'Supermart Pantry Essential'
  },
  {
    id: 'fk-wellness-1',
    title: 'Kapiva Pure Himalayan Shilajit Resin (20g) - Standardized Fulvic Acid for Vitality',
    category: 'wellness',
    rating: 4.6,
    reviewsCount: 19800,
    price: '₹1,149',
    originalPrice: '₹1,499',
    discountPercent: 23,
    flipkartAssured: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    flipkartUrl: 'https://www.flipkart.com/search?q=kapiva+shilajit+resin&affid=nutriglobe',
    highlightBadge: 'Ayurvedic Wellness'
  }
];

interface FlipkartAdBannerProps {
  format?: 'banner' | 'grid' | 'card' | 'compact';
  category?: 'grocery' | 'kitchen' | 'wellness' | 'superfoods' | 'all';
  maxItems?: number;
  title?: string;
  className?: string;
}

export function FlipkartAdBanner({
  format = 'banner',
  category = 'all',
  maxItems = 2,
  title,
  className = ''
}: FlipkartAdBannerProps) {
  const { getLocalizedText } = useTranslation();

  const filteredDeals = FLIPKART_DEALS.filter(
    item => category === 'all' || item.category === category
  ).slice(0, maxItems);

  const displayTitle = title || getLocalizedText('ad.flipkartTitle') || 'Flipkart Grocery & Kitchen Partner Deals';

  // 1. Single Card Format (fits directly in between food cards)
  if (format === 'card') {
    const item = filteredDeals[0] || FLIPKART_DEALS[0];
    return (
      <div className={`relative overflow-hidden h-full flex flex-col bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all justify-between col-span-1 ${className}`}>
        {/* Top Header Tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" /> Flipkart
            </span>
            {item.flipkartAssured && (
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-300 dark:border-amber-800">
                <Check className="w-2.5 h-2.5" /> Assured
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Sponsored</span>
        </div>

        {/* Product Photo */}
        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 my-1 group">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {item.discountPercent && (
            <div className="absolute top-2 right-2 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              {item.discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5 my-2">
          {item.highlightBadge && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block truncate">
              {item.highlightBadge}
            </span>
          )}
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
            {item.title}
          </h4>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-bold text-base text-blue-600 dark:text-blue-400">
              {item.price}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {item.originalPrice}
              </span>
            )}
            <div className="flex items-center text-amber-500 text-[11px] font-bold ml-auto">
              <Star className="w-3 h-3 fill-current mr-0.5" />
              {item.rating}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={item.flipkartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block"
        >
          <Button className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop on Flipkart</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Button>
        </a>
      </div>
    );
  }

  // 2. Banner / Responsive Horizontal Format
  return (
    <div className={`bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 p-4 md:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-100 dark:border-blue-900/40">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
            <ShoppingBag className="w-3 h-3" /> Flipkart Partner
          </span>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {displayTitle}
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
          <Tag className="w-3 h-3 text-blue-500" /> Affiliate Deal
        </span>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredDeals.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-850 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {product.discountPercent && (
                <div className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[9px] font-black text-center py-0.5">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                {product.flipkartAssured && (
                  <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700">
                    Assured
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {product.highlightBadge}
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 leading-snug">
                {product.title}
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-slate-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
                <div className="flex items-center text-amber-500 text-[10px] font-bold ml-auto">
                  <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                  {product.rating}
                </div>
              </div>

              <a
                href={product.flipkartUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 pt-0.5"
              >
                <span>View current offer on Flipkart</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Non-intrusive Transparency Note */}
      <div className="mt-3 pt-2 border-t border-blue-100/60 dark:border-blue-900/30 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>Affiliate partner link. Check offer and pricing on Flipkart.</span>
        <span className="font-mono">Sponsored / Affiliate</span>
      </div>
    </div>
  );
}
