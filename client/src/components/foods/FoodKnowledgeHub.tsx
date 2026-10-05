import React, { useState, useEffect } from 'react';
import type { FoodItemClient, Language } from '@shared/schema';
import { generateFoodKnowledgeProfile, RichFoodKnowledgeProfile } from '@shared/foodKnowledgeEngine';
import { getOrTranslateKnowledgeProfile } from '@shared/foodKnowledgeTranslationService';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Heart, Sparkles, ShieldCheck, HeartPulse, Clock, AlertTriangle, 
  Sprout, BookOpen, Layers, CheckCircle2, Info, ExternalLink, 
  Thermometer, Sun, Droplets, Compass, Utensils, HelpCircle, 
  FileText, ArrowRight, ChevronDown, ChevronUp, Scale, Apple, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FoodKnowledgeHubProps {
  item: FoodItemClient;
  className?: string;
  defaultTab?: string;
}

export function FoodKnowledgeHub({ item, className = '', defaultTab = 'nutrition' }: FoodKnowledgeHubProps) {
  const { t, getLocalizedText, language } = useTranslation();
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [profile, setProfile] = useState<RichFoodKnowledgeProfile>(() => generateFoodKnowledgeProfile(item));

  // Dynamically translate or fetch cached localized profile for active language
  useEffect(() => {
    let isCurrent = true;
    const baseProfile = generateFoodKnowledgeProfile(item);
    getOrTranslateKnowledgeProfile(baseProfile, (language || 'en') as Language).then((localized) => {
      if (isCurrent) {
        setProfile(localized);
      }
    });
    return () => { isCurrent = false; };
  }, [item, language]);

  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Botanical Taxonomy & Identity Quick Bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 p-4 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Taxonomy:
            </span>
            <span className="font-serif italic font-bold text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 px-2.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-700/50">
              {profile.identity.scientificName}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Family: <strong className="text-gray-800 dark:text-gray-200">{profile.identity.family}</strong>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              Edible Part: <strong className="text-gray-800 dark:text-gray-200">{profile.identity.ediblePart}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Medically Responsible & Evidence-Aware</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Dimensional Knowledge Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 w-full bg-gray-100 dark:bg-gray-800/90 p-1.5 rounded-2xl h-auto gap-1">
          <TabsTrigger value="nutrition" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🥗</span>
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="organ" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🫀</span>
            <span className="hidden sm:inline">Organs</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🌿</span>
            <span className="hidden sm:inline">Benefits</span>
          </TabsTrigger>
          <TabsTrigger value="digestion" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>⏱️</span>
            <span className="hidden sm:inline">Timing</span>
          </TabsTrigger>
          <TabsTrigger value="growing" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🌾</span>
            <span className="hidden sm:inline">Growing</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🧊</span>
            <span className="hidden sm:inline">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="culinary" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>🍳</span>
            <span className="hidden sm:inline">Culinary</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>⚠️</span>
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 shadow-xs">
            <span>📖</span>
            <span className="hidden sm:inline">Guide & FAQs</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: NUTRITION & RDA */}
        <TabsContent value="nutrition" className="space-y-6 pt-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Reference Nutrition Profile (per 100g net edible weight)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Standardized USDA FoodData Central & ICMR-NIN nutritional reference criteria.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                100g Standard Basis
              </span>
            </div>

            {/* Core Macronutrients 4-Card Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center shadow-xs">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Energy</span>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {profile.nutritionSummary.calories} <span className="text-xs font-medium text-gray-400">kcal</span>
                </div>
                <span className="text-[10px] text-gray-400">Approx 4% Daily Value</span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center shadow-xs">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Protein</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {profile.nutritionSummary.protein}g
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round((profile.nutritionSummary.protein / 50) * 100)}% RDA
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center shadow-xs">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Carbs</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {profile.nutritionSummary.carbs}g
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                  {Math.round((profile.nutritionSummary.carbs / 130) * 100)}% RDA
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center shadow-xs">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Fiber</span>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {profile.nutritionSummary.fiber}g
                </div>
                <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                  {Math.round((profile.nutritionSummary.fiber / 28) * 100)}% RDA
                </span>
              </div>
            </div>

            {/* Expanded Micronutrients & Lipids Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h5 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Essential Minerals & Electrolytes</span>
                  <span className="text-[10px] text-gray-400 font-normal">Assayed Value</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Potassium (K)</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{profile.nutritionSummary.potassium} mg</strong>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Calcium (Ca)</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{profile.nutritionSummary.calcium}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Iron (Fe)</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{profile.nutritionSummary.iron}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/60 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Magnesium (Mg)</span>
                    <strong className="text-gray-900 dark:text-white font-mono">{profile.nutritionSummary.magnesium}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h5 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Key Vitamins & Micronutrients</span>
                  <span className="text-[10px] text-gray-400 font-normal">Active Form</span>
                </h5>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(profile.nutritionSummary.vitamins).map(([v, val]) => (
                    <div key={v} className="bg-gray-50 dark:bg-gray-900/60 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 font-semibold">Vitamin {v}:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bioactive Compounds Callout */}
            {profile.nutritionSummary.bioactiveCompounds.length > 0 && (
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/50 space-y-1.5">
                <h5 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Bioactive Compounds & Phytochemicals
                </h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.nutritionSummary.bioactiveCompounds.map((bio, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 text-xs py-1">
                      {bio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: ORGAN SUPPORT (Medically Responsible) */}
        <TabsContent value="organ" className="space-y-4 pt-4">
          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Nutritional Relevance by Body Organ & Biological System
            </div>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
              Explaining physiological mechanisms through which dietary nutrients support normal body function. This information describes nutritional roles, not clinical disease treatments or cures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.organSupport.map((os, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2.5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    {os.organDisplayName}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    os.evidenceLevel === 'Strong' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {os.evidenceLevel} Evidence
                  </span>
                </div>

                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div>
                    <strong className="text-gray-900 dark:text-white font-semibold">Nutritional Relevance: </strong>
                    {os.nutritionalRelevance}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-[11px] pt-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Physiological Mechanism: </span>
                    {os.physiologicalMechanism}
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-1">
                  {os.supportingNutrients.map((nut, nIdx) => (
                    <span key={nIdx} className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                      {nut}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: EVIDENCE-BASED BENEFITS */}
        <TabsContent value="benefits" className="space-y-4 pt-4">
          <div className="space-y-3">
            {profile.healthBenefits.map((hb, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {hb.title}
                  </h4>
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
                    Evidence Strength: {hb.evidenceStrength}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-800 dark:text-gray-200">Relevant Nutrient / Compound: </strong>
                  {hb.relevantNutrientOrCompound}
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-700 dark:text-gray-300">Biochemical Mechanism: </strong>
                  {hb.mechanism}
                </p>

                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
                  <span className="font-semibold">Practical Nutritional Value: </span>
                  {hb.practicalRelevance}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: DIGESTION & TIMING */}
        <TabsContent value="digestion" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-1">
              <div className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400">Estimated Digestion Time</div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{profile.digestion.durationRange}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-tight">
                Typical gastric emptying duration based on macronutrient matrix.
              </p>
            </div>

            <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-1">
              <div className="text-xs font-extrabold uppercase text-blue-700 dark:text-blue-400">Digestibility Index</div>
              <div className="text-2xl font-black text-blue-900 dark:text-blue-100">{profile.digestion.digestibility}</div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-tight">
                Relative ease of gastrointestinal mechanical breakdown.
              </p>
            </div>

            <div className="p-5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl space-y-1">
              <div className="text-xs font-extrabold uppercase text-purple-700 dark:text-purple-400">Meal Gap Duration</div>
              <div className="text-2xl font-black text-purple-900 dark:text-purple-100">{profile.digestion.idealMealGapHours} Hours</div>
              <p className="text-[11px] text-purple-700 dark:text-purple-400 leading-tight">
                Recommended interval before consuming heavy meals.
              </p>
            </div>
          </div>

          {profile.digestion.scientificVarianceNote && (
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Evidence & Measurement Context: </strong>
                <span>{profile.digestion.scientificVarianceNote}</span>
              </div>
            </div>
          )}

          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Context-Aware Timing Recommendations
            </h5>

            <div className="flex flex-wrap gap-2">
              {profile.bestTiming.bestTimeOfDay.map((time, idx) => (
                <span key={idx} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {time}
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-800 dark:text-gray-200">Scientific Rationale: </strong>
              {profile.bestTiming.rationale}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Raw vs Cooked Digestibility: </span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">{profile.digestion.rawVsCookedEffect}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Portion Guidance: </span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">{profile.digestion.bestPortionAdvice}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: GROWING & HARVEST */}
        <TabsContent value="growing" className="space-y-4 pt-4">
          {profile.cultivation ? (
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-4">
                <h5 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  Botanical Cultivation & Agricultural Parameters
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Plant Life Cycle</span>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.cultivation.lifeCycle}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Climate Zone</span>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.cultivation.preferredClimate}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Sunlight Needs</span>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.cultivation.sunlightRequirements}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Water Needs</span>
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">{profile.cultivation.waterRequirements}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1">
                    <strong className="text-gray-800 dark:text-gray-200">Soil Requirements: </strong>
                    <p className="text-gray-500 dark:text-gray-400">{profile.cultivation.soilRequirements}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1">
                    <strong className="text-gray-800 dark:text-gray-200">Growth Duration to Harvest: </strong>
                    <p className="text-gray-500 dark:text-gray-400">{profile.cultivation.growthDuration}</p>
                  </div>
                </div>
              </div>

              {/* Seasonality & Regional Hemispheres */}
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Global Harvest Calendar & Seasonality
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Northern Hemisphere: </span>
                    <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{profile.seasonality.regionalVariation.northernHemisphere}</p>
                  </div>
                  <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40">
                    <span className="font-bold text-teal-800 dark:text-teal-300">Southern Hemisphere: </span>
                    <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{profile.seasonality.regionalVariation.southernHemisphere}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="font-bold text-blue-800 dark:text-blue-300">Tropical Microclimates: </span>
                    <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{profile.seasonality.regionalVariation.tropicalSubtropical}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center text-xs text-gray-500">
              Cultivation parameters are specific to plant crops. This food item is classified under standard animal, fungal, or processed agricultural supply systems.
            </div>
          )}
        </TabsContent>

        {/* TAB 6: STORAGE & SHELF LIFE */}
        <TabsContent value="storage" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Whole Fresh</span>
              <div className="font-bold text-xs text-gray-900 dark:text-white">{profile.storage.wholeFresh}</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">Refrigerated</span>
              <div className="font-bold text-xs text-gray-900 dark:text-white">{profile.storage.refrigerated}</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">Cut / Prepared</span>
              <div className="font-bold text-xs text-gray-900 dark:text-white">{profile.storage.cutOrPrepared}</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1.5 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Frozen Storage</span>
              <div className="font-bold text-xs text-gray-900 dark:text-white">{profile.storage.frozen}</div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              Optimal Atmosphere & Storage Parameters
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {profile.storage.temperatureAndHumidity}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-[11px]">
              <strong className="text-gray-700 dark:text-gray-300">Ethylene & Gas Sensitivity: </strong>
              {profile.storage.airAndEthyleneSensitivity}
            </p>
          </div>
        </TabsContent>

        {/* TAB 7: CULINARY & OTHER USES */}
        <TabsContent value="culinary" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                Recommended Culinary Methods & Pairings
              </h5>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {profile.culinaryAndUses.culinaryMethods.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t text-xs">
                <strong className="text-gray-800 dark:text-gray-200">Flavor Profile: </strong>
                <span className="text-gray-500 dark:text-gray-400">{profile.culinaryAndUses.flavorProfile}</span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Non-Food & By-Product Utilization
              </h5>
              <div className="space-y-2.5 text-xs">
                {profile.culinaryAndUses.nonFoodUses.map((nf, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">{nf.useType}</span>
                      <span className="text-[10px] font-semibold bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {nf.status}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">{nf.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 8: SAFETY & CAUTIONS */}
        <TabsContent value="safety" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Allergen Profile & Ingestion Safety
              </h5>
              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-gray-800 dark:text-gray-200">Recognized Allergens: </strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profile.safety.allergens.map((alg, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs">
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-gray-200">Raw Ingestion Caution: </strong>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">{profile.safety.rawConsumptionSafety}</p>
                </div>

                <div className="pt-1 text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-gray-200">Seeds / Toxic Parts: </strong>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">{profile.safety.toxicPartsOrSeeds}</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Clinical Interactions & Condition Watch
              </h5>

              {profile.safety.medicationInteractions.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {profile.safety.medicationInteractions.map((med, i) => (
                    <div key={i} className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/50 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-blue-900 dark:text-blue-200">{med.medicationClass || med.drugClass}</div>
                        {med.evidenceLevel && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md">
                            {med.evidenceLevel} Evidence
                          </span>
                        )}
                      </div>
                      {med.medication && (
                        <div className="text-[11px] text-gray-700 dark:text-gray-300">
                          <strong className="font-semibold">Associated Medications: </strong>
                          {med.medication}
                        </div>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">{med.mechanism}</p>
                      {med.caution && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                          ⚠️ {med.caution}
                        </div>
                      )}
                      {med.source && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          Source: {med.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No common high-risk clinical pharmaceutical interactions documented for standard dietary intake.
                </p>
              )}
            </div>
          </div>

          {/* Mandatory Medical Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800 dark:text-gray-200">Mandatory Medical & Nutritional Notice: </span>
              {profile.safety.medicalDisclaimer}
            </div>
          </div>
        </TabsContent>

        {/* TAB 9: SCIENTIFIC GUIDE & FAQS */}
        <TabsContent value="guide" className="space-y-6 pt-4">
          {/* Scientific Food Article */}
          <article className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-5 shadow-xs">
            <div className="border-b pb-4 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md">
                Authoritative Food Knowledge Guide
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {profile.comprehensiveArticle.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {profile.comprehensiveArticle.leadParagraph}
              </p>
            </div>

            {/* Structured Sections */}
            <div className="space-y-6">
              {profile.comprehensiveArticle.sections.map((sec, sIdx) => (
                <section key={sIdx} className="space-y-2">
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-emerald-600 text-sm font-black">0{sIdx + 1}.</span>
                    {sec.heading}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {sec.body}
                  </p>
                  {sec.highlights && sec.highlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {sec.highlights.map((hl, hIdx) => (
                        <div key={hIdx} className="text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Editorial Conclusion */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold">Editorial Summary: </span>
              {profile.comprehensiveArticle.editorialConclusion}
            </div>
          </article>

          {/* Interesting Facts Carousel/List */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Did You Know? Botanical, Agricultural & Historical Facts
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {profile.interestingFacts.map((fact, idx) => (
                <div key={idx} className="p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-amber-100 dark:border-amber-900/40 text-gray-700 dark:text-gray-300">
                  {fact}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-4 shadow-xs">
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Frequently Asked Questions & Evidence
            </h4>

            <div className="space-y-2">
              {profile.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="border border-gray-100 dark:border-gray-700/60 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(fIdx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {expandedFaqIndex === fIdx ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {expandedFaqIndex === fIdx && (
                    <div className="p-3.5 pt-0 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Authoritative Scientific References */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3 text-xs">
            <div className="font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Authoritative Databases & Scientific Standards
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {profile.references.map((ref, rIdx) => (
                <a
                  key={rIdx}
                  href={ref.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">{ref.sourceName}</span>
                    <span className="text-gray-400 text-[10px]">{ref.dataType}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
