import React, { useState } from 'react';
import { AdBanner } from './AdBanner';
import { AmazonAdBanner } from './AmazonAdBanner';
import { FlipkartAdBanner } from './FlipkartAdBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Sparkles, ShieldCheck, Tag, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
 */
export function FoodItemPartnerAds({
  foodName,
  category,
  className = '',
  defaultTab = 'amazon'
}: FoodItemPartnerAdsProps) {
  const { getLocalizedText } = useTranslation();

  return (
    <div className={`mt-8 space-y-4 ${className}`}>
      {/* Section Header with Transparency & Non-intrusive marker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Recommended Kitchen & Nutrition Partner Deals
          </h3>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
            Verified Partners
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Supporting clinical food research via affiliate partnerships
        </span>
      </div>

      {/* Tabs allowing user to toggle between Amazon, Flipkart, and Google Ads seamlessly */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl max-w-md">
          <TabsTrigger value="amazon" className="rounded-lg text-xs font-bold py-1.5 gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400">
            <span>Amazon Prime</span>
          </TabsTrigger>
          <TabsTrigger value="flipkart" className="rounded-lg text-xs font-bold py-1.5 gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
            <span>Flipkart Grocery</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="rounded-lg text-xs font-bold py-1.5 gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400">
            <span>Google Ads</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Amazon Affiliate Space */}
        <TabsContent value="amazon" className="mt-3 focus-visible:outline-none">
          <AmazonAdBanner
            format="banner"
            category="kitchen"
            maxItems={2}
            title={foodName ? `Amazon Kitchen Tools for Preparing ${foodName}` : 'Top Amazon Kitchen Tools & Macro Scales'}
          />
        </TabsContent>

        {/* Tab 2: Flipkart Affiliate Space */}
        <TabsContent value="flipkart" className="mt-3 focus-visible:outline-none">
          <FlipkartAdBanner
            format="banner"
            category="all"
            maxItems={2}
            title={foodName ? `Flipkart Supermart & Grocery Pairings for ${foodName}` : 'Flipkart Grocery & Kitchen Essentials'}
          />
        </TabsContent>

        {/* Tab 3: Google AdSense Space */}
        <TabsContent value="google" className="mt-3 focus-visible:outline-none">
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google Advertisement</span>
              <span className="text-[10px] font-mono text-slate-400">ca-pub-4353689996620152</span>
            </div>
            <AdBanner slot="2003004005" format="auto" className="my-1" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
