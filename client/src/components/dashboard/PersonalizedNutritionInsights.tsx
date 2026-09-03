import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, Dumbbell, Wheat, Droplets, HeartPulse, Sparkles, ShieldCheck, 
  AlertTriangle, CheckCircle2, TrendingUp, Zap, Apple, Activity, Award
} from 'lucide-react';
import type { FoodItemClient } from '@shared/schema';
import type { UserNutritionProfile } from '@/lib/idb';

interface PersonalizedNutritionInsightsProps {
  favoriteFoods: FoodItemClient[];
  profile: UserNutritionProfile;
  onOpenGoalModal: () => void;
}

const MACRO_COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#f59e0b',   // amber
  fat: '#ef4444',     // red
  fiber: '#10b981'    // emerald
};

export function PersonalizedNutritionInsights({
  favoriteFoods,
  profile,
  onOpenGoalModal
}: PersonalizedNutritionInsightsProps) {
  // Aggregate nutrition totals from saved favorite foods
  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;
    const vitaminsFound: Record<string, number> = {};
    const mineralsFound: Record<string, number> = {};
    let omega3Total = 0;
    let omega6Total = 0;
    let antioxidantsCount = 0;
    let probioticsCount = 0;
    const allergensFound = new Set<string>();

    for (const food of favoriteFoods) {
      const n = food.nutrition || {};
      calories += Number(n.calories) || 0;
      protein += Number(n.protein) || 0;
      carbs += Number(n.carbs) || 0;
      fat += Number(n.fat) || 0;
      fiber += Number(n.fiber) || 0;

      if (n.omega3) omega3Total += Number(n.omega3) || 0;
      if (n.omega6) omega6Total += Number(n.omega6) || 0;
      if (n.antioxidants && Object.keys(n.antioxidants).length > 0) antioxidantsCount += 1;
      if (n.probiotics && Object.keys(n.probiotics).length > 0) probioticsCount += 1;

      // Extract vitamins
      if (n.vitamins && typeof n.vitamins === 'object') {
        for (const [vKey, vVal] of Object.entries(n.vitamins)) {
          if (vVal) {
            const numericMatch = String(vVal).match(/(\d+)/);
            const valNum = numericMatch ? parseInt(numericMatch[1], 10) : 15;
            vitaminsFound[vKey] = (vitaminsFound[vKey] || 0) + valNum;
          }
        }
      }

      // Extract minerals
      if (n.minerals && typeof n.minerals === 'object') {
        for (const [mKey, mVal] of Object.entries(n.minerals)) {
          if (mVal) {
            const numericMatch = String(mVal).match(/(\d+)/);
            const valNum = numericMatch ? parseInt(numericMatch[1], 10) : 15;
            mineralsFound[mKey] = (mineralsFound[mKey] || 0) + valNum;
          }
        }
      }

      // Extract allergens
      if (Array.isArray(food.allergens)) {
        food.allergens.forEach(a => allergensFound.add(a));
      }
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      vitaminsFound,
      mineralsFound,
      omega3Total: Math.round(omega3Total * 10) / 10,
      omega6Total: Math.round(omega6Total * 10) / 10,
      antioxidantsCount,
      probioticsCount,
      allergensFound: Array.from(allergensFound)
    };
  }, [favoriteFoods]);

  // Macro Calorie Distribution for Pie Chart
  const macroPieData = useMemo(() => {
    const proteinKcal = totals.protein * 4;
    const carbsKcal = totals.carbs * 4;
    const fatKcal = totals.fat * 9;
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    if (totalMacroKcal === 0) {
      return [
        { name: 'Carbs', value: 50, color: MACRO_COLORS.carbs },
        { name: 'Protein', value: 25, color: MACRO_COLORS.protein },
        { name: 'Fat', value: 25, color: MACRO_COLORS.fat }
      ];
    }

    return [
      { 
        name: 'Carbohydrates', 
        value: Math.round((carbsKcal / totalMacroKcal) * 100), 
        grams: totals.carbs,
        color: MACRO_COLORS.carbs 
      },
      { 
        name: 'Protein', 
        value: Math.round((proteinKcal / totalMacroKcal) * 100), 
        grams: totals.protein,
        color: MACRO_COLORS.protein 
      },
      { 
        name: 'Healthy Fats', 
        value: Math.round((fatKcal / totalMacroKcal) * 100), 
        grams: totals.fat,
        color: MACRO_COLORS.fat 
      }
    ];
  }, [totals]);

  // Comparison Bar Chart (Actual vs Target)
  const comparisonData = useMemo(() => {
    return [
      {
        name: 'Protein',
        actual: totals.protein,
        target: profile.proteinTarget,
        unit: 'g'
      },
      {
        name: 'Carbs',
        actual: totals.carbs,
        target: profile.carbsTarget,
        unit: 'g'
      },
      {
        name: 'Fat',
        actual: totals.fat,
        target: profile.fatTarget,
        unit: 'g'
      },
      {
        name: 'Fiber',
        actual: totals.fiber,
        target: profile.fiberTarget,
        unit: 'g'
      }
    ];
  }, [totals, profile]);

  // Nutritional Adherence Score
  const { score, grade, badgeColor } = useMemo(() => {
    if (favoriteFoods.length === 0) {
      return { score: 0, grade: 'N/A', badgeColor: 'bg-slate-500' };
    }

    const calRatio = Math.min(totals.calories / profile.calorieTarget, 1.2);
    const pRatio = Math.min(totals.protein / profile.proteinTarget, 1.2);
    const fibRatio = Math.min(totals.fiber / profile.fiberTarget, 1.2);

    let calculated = Math.round(
      ((Math.min(calRatio, 1) * 0.3) + 
       (Math.min(pRatio, 1) * 0.4) + 
       (Math.min(fibRatio, 1) * 0.3)) * 100
    );

    if (calculated >= 88) return { score: calculated, grade: 'Grade A+ Optimal', badgeColor: 'bg-emerald-600' };
    if (calculated >= 75) return { score: calculated, grade: 'Grade A Well-Balanced', badgeColor: 'bg-teal-600' };
    if (calculated >= 60) return { score: calculated, grade: 'Grade B Moderate', badgeColor: 'bg-blue-600' };
    return { score: calculated, grade: 'Grade C Needs Balance', badgeColor: 'bg-amber-600' };
  }, [totals, profile, favoriteFoods]);

  // Detected Allergen Conflict
  const activeAllergenWarnings = useMemo(() => {
    if (!profile.allergens || profile.allergens.length === 0) return [];
    return profile.allergens.filter(userAllergen => 
      totals.allergensFound.some(found => found.toLowerCase().includes(userAllergen.toLowerCase()))
    );
  }, [profile.allergens, totals.allergensFound]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Profile Overview & Score */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-slate-900 text-white shadow-lg border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">{profile.displayName}&apos;s Nutrition Profile</span>
              <Badge className={`${badgeColor} text-white font-bold text-xs uppercase px-2.5 py-0.5`}>
                {grade}
              </Badge>
            </div>
            <p className="text-xs text-emerald-200/90">
              Focus Archetype: <strong className="capitalize text-white">{profile.dietaryFocus.replace('-', ' ')}</strong> • Based on {favoriteFoods.length} saved favorite foods in your local database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 text-center border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-emerald-300">Intake Score</div>
              <div className="text-xl font-black text-white">{score}%</div>
            </div>
            <button
              onClick={onOpenGoalModal}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Zap className="w-3.5 h-3.5" />
              Adjust Targets
            </button>
          </div>
        </div>
      </div>

      {/* Allergen Warning Banner if matches detected */}
      {activeAllergenWarnings.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-900 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold">Allergen Sensitivity Conflict Detected</div>
            <p className="text-rose-700 dark:text-rose-300">
              Your saved favorites contain ingredients matching your excluded allergens:{' '}
              <strong>{activeAllergenWarnings.join(', ')}</strong>. Review your saved list below.
            </p>
          </div>
        </div>
      )}

      {/* 4-Stat Core Macro Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Calories */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Calories</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totals.calories}</span>
              <span className="text-xs text-slate-500">/ {profile.calorieTarget} kcal</span>
            </div>
            <Progress 
              value={Math.min((totals.calories / profile.calorieTarget) * 100, 100)} 
              className="h-1.5 bg-slate-100 dark:bg-slate-800" 
            />
            <div className="text-[10px] text-slate-500 text-right">
              {Math.round((totals.calories / profile.calorieTarget) * 100)}% of daily goal
            </div>
          </CardContent>
        </Card>

        {/* Protein */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Protein</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totals.protein}g</span>
              <span className="text-xs text-slate-500">/ {profile.proteinTarget}g</span>
            </div>
            <Progress 
              value={Math.min((totals.protein / profile.proteinTarget) * 100, 100)} 
              className="h-1.5 bg-slate-100 dark:bg-slate-800" 
            />
            <div className="text-[10px] text-slate-500 text-right">
              {Math.round((totals.protein / profile.proteinTarget) * 100)}% of target
            </div>
          </CardContent>
        </Card>

        {/* Carbs */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Carbohydrates</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Wheat className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totals.carbs}g</span>
              <span className="text-xs text-slate-500">/ {profile.carbsTarget}g</span>
            </div>
            <Progress 
              value={Math.min((totals.carbs / profile.carbsTarget) * 100, 100)} 
              className="h-1.5 bg-slate-100 dark:bg-slate-800" 
            />
            <div className="text-[10px] text-slate-500 text-right">
              {Math.round((totals.carbs / profile.carbsTarget) * 100)}% of target
            </div>
          </CardContent>
        </Card>

        {/* Fiber & Healthy Fats */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Dietary Fiber</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totals.fiber}g</span>
              <span className="text-xs text-slate-500">/ {profile.fiberTarget}g</span>
            </div>
            <Progress 
              value={Math.min((totals.fiber / profile.fiberTarget) * 100, 100)} 
              className="h-1.5 bg-slate-100 dark:bg-slate-800" 
            />
            <div className="text-[10px] text-slate-500 text-right">
              {Math.round((totals.fiber / profile.fiberTarget) * 100)}% of target (Gut Health)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Macro Caloric Ratio Donut Chart */}
        <Card className="lg:col-span-5 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Macronutrient Calorie Ratio
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage of energy contributed by Carbs, Protein, and Healthy Fats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteFoods.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <Apple className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs">Save food items to your favorites to generate your macro balance chart.</p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {macroPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number, name: string) => [`${val}% of calories`, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(value, entry: any) => (
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {value} ({entry.payload.value}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actual vs Target Bar Chart */}
        <Card className="lg:col-span-7 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Grams Intake vs. RDA Target
            </CardTitle>
            <CardDescription className="text-xs">
              Direct comparison of grams supplied by favorites against your personalized targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip 
                    formatter={(val: number, name: string) => [`${val}g`, name === 'actual' ? 'Saved Actual' : 'Target Goal']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {value === 'actual' ? 'Saved Actual (g)' : 'Target Goal (g)'}
                      </span>
                    )}
                  />
                  <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Micronutrients, Vitamins & Bioactives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vitamins & Minerals Found */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Vitamins & Minerals Highlight
            </CardTitle>
            <CardDescription className="text-xs">
              Key micronutrient representation extracted across your saved favorites
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(totals.vitaminsFound).length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No specific vitamins logged in current favorites.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(totals.vitaminsFound).slice(0, 8).map(([vitamin, val]) => (
                  <div key={vitamin} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">Vitamin {vitamin}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{val}% DV</span>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(totals.mineralsFound).length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Essential Minerals:</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(totals.mineralsFound).slice(0, 6).map(([mineral, val]) => (
                    <Badge key={mineral} variant="outline" className="text-[11px] bg-slate-50 dark:bg-slate-900">
                      {mineral}: ~{val}% DV
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bioactives & Super-Nutrient Badges */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Bioactives & Cellular Health
            </CardTitle>
            <CardDescription className="text-xs">
              Antioxidants, essential fatty acids, and probiotic factors detected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900 text-xs space-y-1">
                <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Antioxidants
                </div>
                <div className="text-lg font-black text-purple-950 dark:text-purple-100">
                  {totals.antioxidantsCount} {totals.antioxidantsCount === 1 ? 'Food' : 'Foods'}
                </div>
                <p className="text-[10px] text-purple-700 dark:text-purple-300">
                  Fights cellular oxidative stress & free radicals
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900 text-xs space-y-1">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-blue-600" /> Omega Fatty Acids
                </div>
                <div className="text-lg font-black text-blue-950 dark:text-blue-100">
                  {totals.omega3Total > 0 ? `${totals.omega3Total}g` : 'Detected'}
                </div>
                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                  Supports brain neuron membrane fluidity & heart health
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Personalized Dietary Recommendation
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {totals.fiber < profile.fiberTarget * 0.7 
                  ? 'Your current favorites are slightly below your daily fiber target. Adding legumes, flax seeds, or leafy greens will optimize digestive gut health.' 
                  : 'Great job! Your saved foods supply a robust spectrum of dietary fiber, supporting microbiome diversity and balanced glycemic response.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
