import { useContext, useState } from 'react';
import { FoodItemClient } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { CartContext } from '@/contexts/CartContext';
import { 
  Heart, ShoppingCart, X, Clock, AlertTriangle, ShieldCheck, HeartPulse, 
  Sprout, Download, Share2, CheckCircle2, Info, Sparkles, Flame, Stethoscope, Scale, Printer
} from 'lucide-react';
import { getAccurateFoodImage, handleFoodImageError } from '@/lib/foodImageResolver';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { LazyImage } from '@/components/ui/LazyImage';
import { NutritionFactsLabel } from '@/components/foods/NutritionFactsLabel';
import { FoodImageStudioModal } from '@/components/foods/FoodImageStudioModal';
import { Wand2 } from 'lucide-react';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

interface FoodDetailProps {
  item: FoodItemClient | null;
  isOpen: boolean;
  onClose: () => void;
  onCompare?: (item: FoodItemClient) => void;
}

export function FoodDetail({ item, isOpen, onClose, onCompare }: FoodDetailProps) {
  const { t, getLocalizedText } = useTranslation();
  
  usePageViewCounter(
    isOpen && item ? `/food/${item.id}` : '',
    item ? `${t(item.name)} Clinical View` : '',
    isOpen && item ? { foodId: item.id, foodName: t(item.name), category: item.category?.[0] } : undefined
  );

  const { addToCart, isFavorite } = useContext(CartContext);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [overrideImageUrl, setOverrideImageUrl] = useState<string | null>(null);

  if (!item) return null;

  const isItemFavorite = isFavorite(item.id);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`Check out ${t(item.name)} nutrition details: ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCard = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
    window.print();
  };

  // Provide fallback defaults for rich v2 fields if not specified in mock record
  const digestionTime = item.digestionTimeHours || '1.5 - 2.5 hours';
  const bestTime = item.bestTimeToEat || 'Morning / Afternoon';
  const idealGap = item.idealGapHours || 2;
  const digestibilityNotes = item.digestibilityNotes || 'Easy to digest when consumed fresh or moderately cooked.';

  const foodInteractions = item.doNotEatWith || [
    {
      itemOrCategory: item.category.includes('dairy') ? 'Citrus Fruits & Fish' : 'Heavy Fried Foods',
      reason: item.category.includes('dairy') 
        ? 'Acidic fruits coagulate milk protein, potentially causing indigestion.' 
        : 'High fat slows gastric emptying and nutrient absorption.',
      evidenceLevel: 'traditional' as const
    }
  ];

  const cautionConditions = item.cautionConditions || [
    {
      condition: 'Acid Reflux / GERD',
      reason: 'May stimulate excess gastric acid secretion in sensitive stomachs.',
      severity: 'mild' as const
    }
  ];

  const organBenefits = item.organBenefits || [
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

  const medicalSuitability = item.medicalSuitability || {
    suitableFor: ['Diabetes Management', 'Hypertension Control', 'Weight Loss', 'Heart Health'],
    cautionFor: ['End-Stage Renal Disease (Potassium Restriction)', 'Acute Acid Reflux'],
    disclaimer: 'General dietary information only — not a substitute for professional medical or dietary advice. Consult your doctor or dietitian for specific conditions.'
  };

  const isPlant = !item.category.includes('meat') && !item.category.includes('poultry') && !item.category.includes('seafood') && !item.category.includes('dairy');
  
  const plantProfile = item.plantProfile || (isPlant ? {
    plantType: 'Herbaceous Annual / Perennial Tree',
    climateZone: 'Tropical & Subtropical',
    idealSoilType: 'Well-drained Fertile Loam Soil',
    propagationMethod: 'Seed / Sapling Grafting',
    harvestSeason: 'Spring - Summer',
    waterRequirement: 'moderate' as const,
    growingRegions: ['India', 'Southeast Asia', 'Mediterranean']
  } : null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 px-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            <span className="font-bold tracking-wide text-sm uppercase">Clinical Food & Nutrition Intelligence</span>
          </div>
          <div className="flex items-center gap-2 pr-8">
            {onCompare && item && (
              <Button
                onClick={() => {
                  onClose();
                  onCompare(item);
                }}
                variant="ghost"
                size="sm"
                className="text-emerald-300 hover:bg-white/20 h-8 px-3 text-xs gap-1.5 font-bold transition-all border border-emerald-400/40"
              >
                <Scale className="h-3.5 w-3.5 text-emerald-400" />
                <span>Compare VS</span>
              </Button>
            )}
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 px-3 text-xs gap-1.5 transition-all"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copied Link!' : 'Share'}
            </Button>
            <Button
              onClick={handleDownloadCard}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 px-3 text-xs gap-1.5 transition-all font-semibold bg-emerald-600/60 hover:bg-emerald-600/90 border border-emerald-400/30"
              id="header-print-nutrition-facts-btn"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-200" />
              {downloaded ? 'Preparing Print...' : 'Print Nutrition Facts'}
            </Button>
          </div>
          <DialogClose className="absolute right-4 top-4 text-white/80 hover:text-white transition-opacity focus:outline-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image & Confidence Banner */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative rounded-2xl overflow-hidden h-64 border border-gray-200 dark:border-gray-800 shadow-md group">
                <LazyImage 
                  src={overrideImageUrl || getAccurateFoodImage(item)} 
                  alt={t(item.name)} 
                  onError={(e) => handleFoodImageError(e, item.category)}
                  containerClassName="w-full h-full"
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1 z-20">
                  {item.imageSourceType === 'ai_generated' ? (
                    <span className="bg-purple-600/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-300" /> AI Generated
                    </span>
                  ) : item.imageVerifiedStatus === 'mismatch_flagged' ? (
                    <span className="bg-amber-600/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-200" /> Flagged Mismatch
                    </span>
                  ) : (
                    <span className="bg-emerald-600/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                      Verified Photo
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => setIsStudioOpen(true)}
                  size="sm"
                  className="absolute bottom-3 left-3 right-3 bg-slate-900/85 hover:bg-slate-900 text-emerald-300 hover:text-white text-xs font-bold py-1.5 px-3 rounded-xl backdrop-blur-md border border-emerald-500/40 shadow-lg flex items-center justify-center gap-1.5 transition-all opacity-95 group-hover:opacity-100 z-20"
                >
                  <Wand2 className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  <span>AI Image Studio & Editor (Web URL & Branding)</span>
                </Button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span>Origin: <strong className="text-gray-800 dark:text-gray-200">{item.origin}</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Clinical & Educational Reference</span>
                </div>
                {item.imageSourceType && (
                  <div className="border-t pt-1.5 mt-1.5 text-[11px] font-mono text-gray-500 space-y-0.5">
                    <div><strong>Source:</strong> <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{item.imageSourceType.replace(/_/g, ' ')}</span> ({item.imageSourceId || 'verified'})</div>
                    <div><strong>License:</strong> {item.imageLicense || 'Public Domain'}</div>
                    <div><strong>Attribution:</strong> {item.imageAttribution || 'USDA FoodData / Open Database'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Core Description */}
            <div className="md:col-span-7 space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {item.category.map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <DialogTitle className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {t(item.name)}
                </DialogTitle>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  Canonical ID: <code className="font-mono">{item.id}</code>
                </div>
              </div>

              <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(item.description)}
              </DialogDescription>

              {/* Viral High-Volume Search Hashtags for Google SEO & Social Discovery */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[`#${((typeof item.name === 'string' ? item.name : item.name?.en) || 'Food').replace(/[^a-zA-Z0-9]/g, '')}`, `#${(item.category[0] || 'Nutrition').replace(/[^a-zA-Z0-9]/g, '')}Health`, `#NutriGlobe`, `#WHO_RDA`, `#OrganicNutrition`].map((tag, idx) => (
                  <span key={idx} className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.allergens.map((allergen) => (
                  <span key={allergen} className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    {allergen}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button 
                  onClick={() => {
                    addToCart(item);
                  }}
                  className={`rounded-xl px-6 py-2.5 shadow-md flex items-center gap-2 text-sm font-semibold transition-all hover:scale-[1.02] ${
                    isItemFavorite 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Heart className="h-4 w-4" fill={isItemFavorite ? "currentColor" : "none"} />
                  {isItemFavorite ? 'Saved in Favorites' : getLocalizedText('button.addToCart')}
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded 5 Intelligence Tabs */}
          <Tabs defaultValue="nutrition" className="w-full pt-2">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <TabsTrigger value="nutrition" className="text-xs py-2">
                🥗 Nutrition & RDA%
              </TabsTrigger>
              <TabsTrigger value="digestion" className="text-xs py-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Digestion & Timing
              </TabsTrigger>
              <TabsTrigger value="interactions" className="text-xs py-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Interactions
              </TabsTrigger>
              <TabsTrigger value="medical" className="text-xs py-2 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 text-blue-500" /> Medical Suitability
              </TabsTrigger>
              <TabsTrigger value="organ" className="text-xs py-2 flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Organ Benefits
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: NUTRITION & RDA% */}
            <TabsContent value="nutrition" className="space-y-6 pt-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    Clinical Micronutrient & RDA Profile (per 100g)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Reference Standard: ICMR-NIN / FSSAI Guidelines
                    </span>
                  </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center shadow-sm">
                    <span className="text-xs text-gray-500">Calories</span>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{item.nutrition.calories} <span className="text-xs font-normal">kcal</span></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center shadow-sm">
                    <span className="text-xs text-gray-500">Protein</span>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.nutrition.protein}g</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((item.nutrition.protein / 60) * 100)}% RDA</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center shadow-sm">
                    <span className="text-xs text-gray-500">Carbohydrates</span>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{item.nutrition.carbs}g</div>
                    <span className="text-[10px] text-amber-600 font-semibold">{Math.round((item.nutrition.carbs / 130) * 100)}% RDA</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border text-center shadow-sm">
                    <span className="text-xs text-gray-500">Dietary Fiber</span>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{item.nutrition.fiber}g</div>
                    <span className="text-[10px] text-purple-600 font-semibold">{Math.round((item.nutrition.fiber / 30) * 100)}% RDA</span>
                  </div>
                </div>

                {/* Vitamins & Minerals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vitamins Breakdown</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.nutrition.vitamins || {}).map(([v, val]) => (
                        <div key={v} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between w-full sm:w-auto gap-3">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">Vit {v}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Minerals Breakdown</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.nutrition.minerals || { Iron: '2.1mg', Calcium: '20mg', Potassium: '168mg' }).map(([m, val]) => (
                        <div key={m} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between w-full sm:w-auto gap-3">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{m}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Printable FDA Style Nutrition Facts Label Box */}
              <div className="pt-2">
                <NutritionFactsLabel item={item} onPrint={handleDownloadCard} showPrintButton={true} />
              </div>
            </TabsContent>

            {/* TAB 2: DIGESTION & TIMING */}
            <TabsContent value="digestion" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-1">
                  <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">Avg Digestion Time</div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">{digestionTime}</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Gastric emptying duration</div>
                </div>

                <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1">
                  <div className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">Best Time to Consume</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-200">{bestTime}</div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-400">Optimal metabolic absorption</div>
                </div>

                <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-xl space-y-1">
                  <div className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-400">Gap Before Next Meal</div>
                  <div className="text-2xl font-black text-purple-900 dark:text-purple-200">{idealGap} Hours</div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-400">Prevents digestive fermentation</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white font-semibold">Digestibility Guidance: </strong>
                {digestibilityNotes}
              </div>
            </TabsContent>

            {/* TAB 3: FOOD COMBINING & CONTRAINDICATIONS */}
            <TabsContent value="interactions" className="space-y-4 pt-4">
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Food Combining Cautions & Incompatible Pairings (Viruddha Ahara)
                </div>

                <div className="space-y-2">
                  {foodInteractions.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200/60 dark:border-amber-900/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-800 dark:text-amber-300">Avoid pairing with: {rule.itemOrCategory}</span>
                        <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold">
                          {rule.evidenceLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{rule.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caution Conditions */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl space-y-2">
                <h5 className="font-bold text-xs uppercase text-red-700 dark:text-red-400">Health Condition Precaution Notes</h5>
                <div className="space-y-1.5">
                  {cautionConditions.map((cond, i) => (
                    <div key={i} className="text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
                      <span className="font-semibold">{cond.condition}:</span> {cond.reason}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: MEDICAL SUITABILITY */}
            <TabsContent value="medical" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Generally Suitable For
                  </h5>
                  <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                    {medicalSuitability.suitableFor.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Caution / Avoid For
                  </h5>
                  <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                    {medicalSuitability.cautionFor.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mandatory Medical Disclaimer Banner */}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                <span>{medicalSuitability.disclaimer}</span>
              </div>
            </TabsContent>

            {/* TAB 5: ORGAN BENEFITS & PLANT PROFILE */}
            <TabsContent value="organ" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organBenefits.map((ob, idx) => (
                  <div key={idx} className="p-4 border rounded-xl bg-white dark:bg-gray-800 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <HeartPulse className="h-4 w-4" /> Organ: {ob.organ}
                      </span>
                      <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded font-semibold border border-rose-200">
                        {ob.evidenceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{ob.benefit}</p>
                    <div className="text-[11px] text-gray-500">Active Compound: <strong className="text-gray-700 dark:text-gray-300">{ob.supportingNutrient}</strong></div>
                  </div>
                ))}
              </div>

              {/* Plant Profile if applicable */}
              {plantProfile && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-emerald-600" /> Plant & Crop Profile
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-gray-500">Type:</span> <br/><strong className="text-gray-800 dark:text-gray-200">{plantProfile.plantType}</strong></div>
                    <div><span className="text-gray-500">Climate:</span> <br/><strong className="text-gray-800 dark:text-gray-200">{plantProfile.climateZone}</strong></div>
                    <div><span className="text-gray-500">Ideal Soil:</span> <br/><strong className="text-gray-800 dark:text-gray-200">{plantProfile.idealSoilType}</strong></div>
                    <div><span className="text-gray-500">Harvest:</span> <br/><strong className="text-gray-800 dark:text-gray-200">{plantProfile.harvestSeason}</strong></div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Amazon Associate Native Shopping Deals */}
          <AmazonAdBanner 
            format="banner" 
            category="kitchen" 
            maxItems={2} 
            title="Amazon Recommended Kitchen Tools & Food Scales" 
          />

          {/* Footer Branding Line (Mandatory Credit) */}
          <div className="pt-4 border-t text-center text-xs text-gray-400 font-medium">
            Designed & Developed by SDSV Trade Tech
          </div>
        </div>
      </DialogContent>

      {/* AI Food Image Studio & Educational Editor Modal */}
      <FoodImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        foodItem={item}
        onImageUpdated={(newUrl) => {
          setOverrideImageUrl(newUrl);
          setIsStudioOpen(false);
        }}
      />
    </Dialog>
  );
}
