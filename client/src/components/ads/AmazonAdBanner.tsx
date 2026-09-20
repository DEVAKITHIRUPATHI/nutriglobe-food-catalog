import React, { useEffect, useRef } from 'react';
import { ShoppingBag, ExternalLink, Star, ShieldCheck, Tag, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface AmazonProduct {
  id: string;
  title: string;
  category: 'kitchen' | 'supplements' | 'scales' | 'fitness' | 'books';
  rating: number;
  reviewsCount: number;
  price: string;
  originalPrice?: string;
  prime: boolean;
  imageUrl: string;
  asin: string;
  amazonUrl: string;
  highlightBadge?: string;
}

const AMAZON_DEALS: AmazonProduct[] = [
  {
    id: 'amz-scale-1',
    title: 'Digital Kitchen Food Scale for Meal Prep & Calorie Tracking (0.1g Precision)',
    category: 'scales',
    rating: 4.8,
    reviewsCount: 12450,
    price: '$13.99',
    originalPrice: '$19.99',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80',
    asin: 'B0113GAN44',
    amazonUrl: 'https://www.amazon.com/dp/B0113GAN44?tag=nutriglobe20-20',
    highlightBadge: 'Top Pick for Macro Tracking'
  },
  {
    id: 'amz-blender-1',
    title: 'NutriBullet Personal Blender 600W for High-Fiber Nutrient Extraction',
    category: 'kitchen',
    rating: 4.7,
    reviewsCount: 38200,
    price: '$59.99',
    originalPrice: '$69.99',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80',
    asin: 'B007TUOE28',
    amazonUrl: 'https://www.amazon.com/dp/B007TUOE28?tag=nutriglobe20-20',
    highlightBadge: 'Best Smoothie Maker'
  },
  {
    id: 'amz-supp-1',
    title: 'Optimum Nutrition Gold Standard 100% Whey Protein Powder (5 lbs, Double Rich Chocolate)',
    category: 'supplements',
    rating: 4.8,
    reviewsCount: 95400,
    price: '$74.99',
    originalPrice: '$84.99',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
    asin: 'B000QSNYGI',
    amazonUrl: 'https://www.amazon.com/dp/B000QSNYGI?tag=nutriglobe20-20',
    highlightBadge: '#1 Best Seller in Sports Nutrition'
  },
  {
    id: 'amz-prep-1',
    title: 'BPA-Free Glass Meal Prep Containers 3-Compartment with Airtight Lids (Pack of 5)',
    category: 'kitchen',
    rating: 4.6,
    reviewsCount: 18900,
    price: '$29.99',
    originalPrice: '$39.99',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
    asin: 'B07954MDTX',
    amazonUrl: 'https://www.amazon.com/dp/B07954MDTX?tag=nutriglobe20-20',
    highlightBadge: 'Eco-Friendly Meal Prep'
  },
  {
    id: 'amz-book-1',
    title: 'How Not to Die: Discover the Foods Scientifically Proven to Prevent and Reverse Disease',
    category: 'books',
    rating: 4.9,
    reviewsCount: 22100,
    price: '$16.89',
    originalPrice: '$28.00',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    asin: '1250066115',
    amazonUrl: 'https://www.amazon.com/dp/1250066115?tag=nutriglobe20-20',
    highlightBadge: 'New York Times Bestseller'
  },
  {
    id: 'amz-fit-1',
    title: 'Smart Body Fat Scale with Bluetooth & BMI Muscle Mass Composition Analyzer',
    category: 'fitness',
    rating: 4.7,
    reviewsCount: 42000,
    price: '$24.99',
    originalPrice: '$34.99',
    prime: true,
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=400&q=80',
    asin: 'B01N1UX8RW',
    amazonUrl: 'https://www.amazon.com/dp/B01N1UX8RW?tag=nutriglobe20-20',
    highlightBadge: 'Syncs with Apple Health & Fitbit'
  }
];

interface AmazonAdBannerProps {
  category?: 'kitchen' | 'supplements' | 'scales' | 'fitness' | 'books' | 'all';
  format?: 'banner' | 'sidebar' | 'grid' | 'inline';
  trackingId?: string;
  className?: string;
  maxItems?: number;
  title?: string;
}

export const AmazonAdBanner: React.FC<AmazonAdBannerProps> = ({
  category = 'all',
  format = 'banner',
  trackingId = 'nutriglobe20-20',
  className = '',
  maxItems = 2,
  title = 'Featured Amazon Kitchen & Wellness Deals'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredDeals = AMAZON_DEALS.filter(item => 
    category === 'all' ? true : item.category === category
  ).slice(0, maxItems);

  // If no specific category items matched, fallback to all
  const displayDeals = filteredDeals.length > 0 ? filteredDeals : AMAZON_DEALS.slice(0, maxItems);

  if (format === 'sidebar') {
    return (
      <div className={`bg-gradient-to-b from-amber-500/5 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 ${className}`}>
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Amazon Associate Deals</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ad</span>
        </div>

        <div className="space-y-3">
          {displayDeals.map((deal) => (
            <a
              key={deal.id}
              href={deal.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl transition-all duration-200"
            >
              <div className="flex gap-3 items-center">
                <img 
                  src={deal.imageUrl} 
                  alt={deal.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-800 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  {deal.highlightBadge && (
                    <span className="inline-block text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mb-1">
                      {deal.highlightBadge}
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 line-clamp-2 leading-snug">
                    {deal.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-amber-400">{deal.price}</span>
                      {deal.originalPrice && (
                        <span className="text-[10px] text-slate-500 line-through">{deal.originalPrice}</span>
                      )}
                    </div>
                    {deal.prime && (
                      <span className="text-[10px] font-black italic text-sky-400">prime</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-[9px] text-slate-500 text-center pt-1 border-t border-slate-800/60 leading-tight">
          As an Amazon Associate, NutriGlobe earns from qualifying purchases.
        </div>
      </div>
    );
  }

  if (format === 'grid') {
    return (
      <div className={`my-6 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-widest">Sponsored (paid link)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayDeals.map((deal) => (
            <a
              key={deal.id}
              href={deal.amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {deal.prime && (
                    <span className="absolute top-2 right-2 bg-slate-900/90 text-sky-400 font-extrabold text-[10px] italic px-2 py-0.5 rounded-md border border-sky-400/30">
                      prime
                    </span>
                  )}
                  {deal.highlightBadge && (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow">
                      {deal.highlightBadge}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{deal.rating}</span>
                    <span className="text-slate-400 font-normal">({deal.reviewsCount.toLocaleString()})</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-amber-500 line-clamp-2 leading-relaxed">
                    {deal.title}
                  </h4>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Check current offer</span>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl gap-1">
                  <span>View on Amazon</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </a>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
          As an Amazon Associate I earn from qualifying purchases. (paid link)
        </p>
      </div>
    );
  }

  // Default 'banner' layout
  return (
    <div className={`my-6 w-full rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 border border-amber-500/30 p-4 shadow-lg ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Amazon Storefront
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Affiliate Ad</span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-0.5">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {displayDeals.map((deal) => (
            <a
              key={deal.id}
              href={deal.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 p-2 pr-3 rounded-xl transition-all"
            >
              <img 
                src={deal.imageUrl} 
                alt={deal.title}
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-800"
              />
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-200 line-clamp-1 max-w-[160px] block">
                  {deal.title}
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <strong className="text-amber-400 font-mono">{deal.price}</strong>
                  {deal.prime && <span className="text-sky-400 italic font-black">prime</span>}
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 ml-1 shrink-0" />
            </a>
          ))}
        </div>
      </div>
      <div className="text-[9px] text-slate-500 text-right mt-2 font-mono">
        NutriGlobe Amazon Associate ID: <code className="text-slate-400">{trackingId}</code> • Qualifying Purchases Earn Commission
      </div>
    </div>
  );
};
