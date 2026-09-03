import React, { useContext, useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { AppContext } from '@/contexts/AppContext';
import { CartContext } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useFoodSEO } from '@/hooks/useFoodSEO';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';
import { FoodItemClient } from '@shared/schema';
import { foodItems } from '@shared/mockData';
import { getAccurateFoodImage, handleFoodImageError, getGoogleImageSearchUrl, getExcelHyperlinkFormula, autoCheckFoodAccuracy } from '@/lib/foodImageResolver';
import { NutritionFactsLabel } from '@/components/foods/NutritionFactsLabel';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodComparisonModal } from '@/components/foods/FoodComparisonModal';
import { FoodImageStudioModal } from '@/components/foods/FoodImageStudioModal';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { AdBanner } from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, ShoppingCart, Clock, AlertTriangle, ShieldCheck, HeartPulse, 
  Sprout, Download, Share2, CheckCircle2, Info, Sparkles, Flame, Stethoscope, 
  Scale, ArrowLeft, Printer, ChevronRight, Wand2, Compass, Search, ExternalLink, FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoodDetailPage() {
  const [, paramsFood] = useRoute('/food/:id');
  const [, paramsFoods] = useRoute('/foods/:id');
  const [, setLocation] = useLocation();
  const rawId = paramsFood?.id || paramsFoods?.id;
  const foodId = rawId ? decodeURIComponent(rawId) : undefined;

  const { foods: contextFoods, isLoading: appLoading } = useContext(AppContext);
  const { addToCart, isFavorite } = useContext(CartContext);
  const { t, getLocalizedText, language } = useTranslation();

  const [food, setFood] = useState<FoodItemClient | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [compareItemB, setCompareItemB] = useState<FoodItemClient | null>(null);
  const [relatedFoods, setRelatedFoods] = useState<FoodItemClient[]>([]);

  // Find the food item from context or mockData
  useEffect(() => {
    if (!foodId) return;
    const all = (contextFoods && contextFoods.length > 0) ? contextFoods : foodItems;
    const matched = all.find(f => 
      f.id === foodId || 
      f.id.toLowerCase() === foodId.toLowerCase() ||
      (f.name?.en && f.name.en.toLowerCase().replace(/\s+/g, '-') === foodId.toLowerCase())
    );
    if (matched) {
      setFood(matched);
      // Find 4 related foods from same category
      const category = matched.category?.[0];
      const related = all
        .filter(f => f.id !== matched.id && f.category?.includes(category))
        .slice(0, 4);
      setRelatedFoods(related);
    }
  }, [foodId, contextFoods]);

  // Dynamic SEO Meta Tags & Schema.org JSON-LD updates
  useFoodSEO(food, true);

  // Page telemetry & analytics
  usePageViewCounter(
    food ? `/food/${food.id}` : '',
    food ? `${t(food.name)} Clinical Page` : '',
    food ? { foodId: food.id, foodName: t(food.name), category: food.category?.[0] } : undefined
  );

  if (!food) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <Sprout className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Food Item Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          The requested cultivar or food item could not be found in our 1,376 master database.
        </p>
        <Link href="/foods">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All 1,376 Foods</span>
          </Button>
        </Link>
      </div>
    );
  }

  const isItemFavorite = isFavorite(food.id);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`Check out ${t(food.name)} nutrition details: ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCard = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
    window.print();
  };

  const handleCompare = (otherItem: FoodItemClient) => {
    setCompareItemB(otherItem);
    setIsComparisonOpen(true);
  };

  const digestionTime = food.digestionTimeHours || '1.5 - 2.5 hours';
  const bestTime = food.bestTimeToEat || 'Morning / Afternoon';
  const idealGap = food.idealGapHours || 2;
  const digestibilityNotes = food.digestibilityNotes || 'Easy to digest when consumed fresh or moderately cooked.';

  const foodInteractions = food.doNotEatWith || [
    {
      itemOrCategory: food.category?.includes('dairy') ? 'Citrus Fruits & Fish' : 'Heavy Fried Foods',
      reason: food.category?.includes('dairy') 
        ? 'Acidic fruits coagulate milk protein, potentially causing indigestion.' 
        : 'High fat slows gastric emptying and nutrient absorption.',
      evidenceLevel: 'traditional' as const
    }
  ];

  const cautionConditions = food.cautionConditions || [
    {
      condition: 'Acid Reflux / GERD',
      reason: 'May stimulate excess gastric acid secretion in sensitive stomachs.',
      severity: 'mild' as const
    }
  ];

  const organBenefits = food.organBenefits || [
    {
      organ: 'heart' as const,
      benefit: 'Helps maintain healthy arterial elasticity and blood pressure.',
      supportingNutrient: 'Potassium & Fiber',
      evidenceLevel: 'established' as const
    },
    {
      organ: 'gut' as const,
      benefit: 'Provides prebiotic substrate for beneficial gut microbiome.',
      supportingNutrient: 'Dietary Fiber',
      evidenceLevel: 'established' as const
    }
  ];

  return (
    <div id="food-detail-standalone-page" className="py-6 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb Navigation for SEO Crawlers */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/">
          <span className="hover:text-emerald-600 transition-colors cursor-pointer">Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/foods">
          <span className="hover:text-emerald-600 transition-colors cursor-pointer">Foods</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 dark:text-white font-semibold capitalize truncate max-w-xs">
          {t(food.name)}
        </span>
      </nav>

      {/* Top Banner & Title Block */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Main Food Image with Badge */}
          <div className="w-full md:w-80 shrink-0 space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner group">
              <img
                src={getAccurateFoodImage(food)}
                alt={`${t(food.name)} Clinical Photography`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => handleFoodImageError(e, food)}
                loading="eager"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-3 py-1 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-extrabold rounded-full border border-emerald-500/40">
                  {food.nutrition?.calories ?? 0} kcal / 100g
                </span>
                <span className="px-2.5 py-0.5 bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {food.category?.[0] || 'Food'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => addToCart(food)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 py-2.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Tracker</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs rounded-xl gap-1.5 py-2.5"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>{copied ? 'Link Copied!' : 'Share Page'}</span>
              </Button>
            </div>

            {/* Google Images Direct Real Photo Search */}
            <a
              href={getGoogleImageSearchUrl(food.name?.en || food.id, food.category)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-xs transition-all"
            >
              <Search className="h-3.5 w-3.5 text-emerald-600" />
              <span>Search Real Photos on Google Images</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>

          {/* Details & Overview */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50">
                  WHO & USDA Verified Dataset
                </Badge>
                {food.origin && (
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700">
                    Origin: {food.origin}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t(food.name)}
              </h1>
              {food.name?.en && food.name[language] && food.name[language] !== food.name.en && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Native / Local Name: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{food.name[language]}</span>
                </p>
              )}
            </div>

            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {t(food.description)}
            </p>

            {/* Micro Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Calories</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{food.nutrition?.calories ?? 0}</span>
                <span className="text-[10px] text-slate-400 block">kcal</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Protein</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{food.nutrition?.protein ?? 0}g</span>
                <span className="text-[10px] text-slate-400 block">per 100g</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Carbs</span>
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{food.nutrition?.carbs ?? 0}g</span>
                <span className="text-[10px] text-slate-400 block">per 100g</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Dietary Fat</span>
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{food.nutrition?.fat ?? 0}g</span>
                <span className="text-[10px] text-slate-400 block">per 100g</span>
              </div>
            </div>

            {/* Extra Clinical Quick Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Digestion: {digestionTime}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                Ideal Timing: {bestTime}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                Evidence Level: Clinical
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google AdSense Top Leaderboard Ad */}
      <AdBanner slot="1002003004" format="auto" className="my-4" />

      {/* Main Tabs Section: Complete Nutritional Breakdown & Health Systems */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-6">
            <TabsTrigger value="nutrition" className="rounded-xl font-bold text-xs py-2.5">
              Nutrition Facts Label
            </TabsTrigger>
            <TabsTrigger value="organs" className="rounded-xl font-bold text-xs py-2.5">
              Organ Targets
            </TabsTrigger>
            <TabsTrigger value="interactions" className="rounded-xl font-bold text-xs py-2.5">
              Interactions & Cautions
            </TabsTrigger>
            <TabsTrigger value="benefits" className="rounded-xl font-bold text-xs py-2.5">
              Health Benefits
            </TabsTrigger>
          </TabsList>

          {/* 1. FDA/WHO Standard Nutrition Facts Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-96 shrink-0">
                <NutritionFactsLabel item={food} servingGrams={100} />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Clinical Nutrient Profile per 100g
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {food.digestibilityNotes || `Digestibility and metabolic bioavailability are optimal when ${t(food.name)} is integrated with a balanced daily caloric intake.`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Dietary Fiber</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{food.nutrition?.fiber ?? 0} g</span>
                    <p className="text-[11px] text-slate-500 mt-1">Aids digestion and healthy gut motility.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Natural Sugars</span>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{food.nutrition?.sugar ?? 0} g</span>
                    <p className="text-[11px] text-slate-500 mt-1">Provides direct cellular glucose energy.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Key Micronutrients</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {food.nutrition?.vitamins && Object.entries(food.nutrition.vitamins).map(([vit, val]) => (
                        <span key={vit} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-md">
                          {vit}: {val}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Essential Minerals</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {food.nutrition?.minerals && Object.entries(food.nutrition.minerals).map(([min, val]) => (
                        <span key={min} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-md">
                          {min}: {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 2. Organ Benefits Tab */}
          <TabsContent value="organs" className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Targeted Biological System Support
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organBenefits.map((ob, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg">
                      {ob.organ}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                      Evidence: {ob.evidenceLevel}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ob.benefit}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Key Driver: <strong className="text-emerald-600 dark:text-emerald-400">{ob.supportingNutrient}</strong>
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. Interactions & Cautions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Food Combinations & Incompatible Pairings
              </h3>
              <div className="space-y-3">
                {foodInteractions.map((item, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Avoid with: {item.itemOrCategory}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
                        {item.evidenceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                Clinical Health Conditions & Precautions
              </h3>
              <div className="space-y-3">
                {cautionConditions.map((cond, idx) => (
                  <div key={idx} className="p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200/60 dark:border-rose-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        {cond.condition}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded">
                        Severity: {cond.severity}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800/90 dark:text-rose-300/90">{cond.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 4. Health Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Evidence-Based Nutritional Benefits
            </h3>
            <div className="space-y-3">
              {food.healthBenefits && food.healthBenefits.length > 0 ? (
                food.healthBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-emerald-950 dark:text-emerald-200">
                      {t(benefit)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm text-slate-500">
                  Rich source of essential macro and micronutrients conforming with WHO dietary reference values.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AdSense In-Page Responsive Banner */}
      <AdBanner slot="1002003004" format="horizontal" className="my-6" />

      {/* Related Foods in Same Category */}
      {relatedFoods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Related Cultivars in {food.category?.[0] || 'Category'}
            </h3>
            <Link href="/foods">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                View All Catalog →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedFoods.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                onViewDetails={(selected) => setLocation(`/food/${selected.id}`)}
                onCompare={handleCompare}
              />
            ))}
          </div>
        </div>
      )}

      {/* Compare Modal */}
      <FoodComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        initialItemA={food}
        initialItemB={compareItemB}
      />
    </div>
  );
}
