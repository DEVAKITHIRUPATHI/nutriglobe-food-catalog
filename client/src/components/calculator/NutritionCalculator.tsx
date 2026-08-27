import { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Calculator, Activity, Heart, ShieldAlert, Sparkles, Scale, Flame, 
  Droplets, Apple, Info, Download, Printer, CheckCircle2, Stethoscope, 
  ChevronRight, ArrowUpRight, Dumbbell, UserCheck, RefreshCw, PieChart as PieIcon, Share2,
  TrendingDown, TrendingUp, Ban, GlassWater, Sun, Wind, Target, Zap, ShieldX, Coffee, HeartPulse
} from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { FoodItemClient } from '@shared/schema';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { NutritionShareCardModal } from './NutritionShareCardModal';
import { exportNutritionCalculatorPDF } from '@/lib/pdfExporter';
import { WeightFatLossPlanner } from './WeightFatLossPlanner';
import { NutritionNotificationManager } from './NutritionNotificationManager';

// Life Stages for clinical precision
type Sex = 'male' | 'female' | 'pregnant_t1' | 'pregnant_t2' | 'pregnant_t3' | 'lactating';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
type Goal = 'maintain' | 'mild_loss' | 'loss' | 'extreme_loss' | 'mild_gain' | 'gain' | 'muscle';
type UnitSystem = 'metric' | 'imperial';

export function NutritionCalculator() {
  const { getLocalizedText, language } = useTranslation();
  const { foods: contextFoods } = useContext(AppContext);

  // Input states
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [age, setAge] = useState<number>(28);
  const [sex, setSex] = useState<Sex>('female');
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(62);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [weightLbs, setWeightLbs] = useState<number>(136);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [selectedFood, setSelectedFood] = useState<FoodItemClient | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [analysisTab, setAnalysisTab] = useState<'current' | 'overweight' | 'underweight'>('current');

  // Smooth Unit System Switcher with dynamic conversion
  const handleUnitSystemChange = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;
    if (newSystem === 'imperial') {
      const totalInches = Math.round((heightCm || 165) / 2.54);
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(totalInches % 12);
      setWeightLbs(Math.round((weightKg || 60) * 2.20462));
    } else {
      const cm = Math.round((((heightFt || 5) * 12) + (heightIn || 0)) * 2.54);
      setHeightCm(cm);
      setWeightKg(Math.round((weightLbs || 132) * 0.453592));
    }
    setUnitSystem(newSystem);
  };

  // Convert inputs to metric for uniform calculations
  const effectiveHeightCm = useMemo(() => {
    if (unitSystem === 'metric') return heightCm || 165;
    const ft = heightFt || 5;
    const inch = heightIn || 0;
    return Math.round(((ft * 12) + inch) * 2.54);
  }, [unitSystem, heightCm, heightFt, heightIn]);

  const effectiveWeightKg = useMemo(() => {
    if (unitSystem === 'metric') return weightKg || 60;
    const lbs = weightLbs || 132;
    return Math.round(lbs * 0.453592);
  }, [unitSystem, weightKg, weightLbs]);

  // Medical & Weight Control calculations
  const calculations = useMemo(() => {
    const hM = effectiveHeightCm / 100;
    const wKg = effectiveWeightKg;
    const aY = age || 25;

    // 1. BMI Calculation
    const bmi = wKg / (hM * hM);
    
    // WHO BMI Category & Color Coding
    let bmiCategory = 'Normal weight';
    let bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    let bmiRisk = 'Low risk (Healthy metabolic range)';
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 bg-amber-50 border-amber-200';
      bmiRisk = 'Risk of nutritional deficiency & osteoporosis';
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = 'Normal weight';
      bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      bmiRisk = 'Optimal healthy metabolic state';
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-amber-700 bg-amber-100 border-amber-300';
      bmiRisk = 'Increased risk of pre-diabetes & hypertension';
    } else if (bmi >= 30 && bmi < 35) {
      bmiCategory = 'Obesity Class I';
      bmiColor = 'text-rose-600 bg-rose-50 border-rose-200';
      bmiRisk = 'High metabolic risk for cardiovascular disease';
    } else if (bmi >= 35 && bmi < 40) {
      bmiCategory = 'Obesity Class II';
      bmiColor = 'text-rose-700 bg-rose-100 border-rose-300';
      bmiRisk = 'Very high clinical risk for type-2 diabetes';
    } else {
      bmiCategory = 'Obesity Class III';
      bmiColor = 'text-purple-700 bg-purple-100 border-purple-300';
      bmiRisk = 'Extremely high clinical cardiovascular risk';
    }

    // Healthy weight range (BMI 18.5 - 24.9) & Mid Ideal Target (BMI 21.7)
    const minHealthyWeight = Math.round(18.5 * hM * hM);
    const maxHealthyWeight = Math.round(24.9 * hM * hM);
    const idealHealthyWeight = Math.round(21.7 * hM * hM);

    // Weight Reduction metrics (for Overweight)
    const kgToReduceForMaxNormal = wKg > maxHealthyWeight ? parseFloat((wKg - maxHealthyWeight).toFixed(1)) : 0;
    const lbsToReduceForMaxNormal = wKg > maxHealthyWeight ? Math.round((wKg - maxHealthyWeight) * 2.20462) : 0;
    const kgToReduceForIdeal = wKg > idealHealthyWeight ? parseFloat((wKg - idealHealthyWeight).toFixed(1)) : 0;
    const lbsToReduceForIdeal = wKg > idealHealthyWeight ? Math.round((wKg - idealHealthyWeight) * 2.20462) : 0;

    // Weight Increase metrics (for Underweight)
    const kgToGainForMinNormal = wKg < minHealthyWeight ? parseFloat((minHealthyWeight - wKg).toFixed(1)) : 0;
    const lbsToGainForMinNormal = wKg < minHealthyWeight ? Math.round((minHealthyWeight - wKg) * 2.20462) : 0;
    const kgToGainForIdeal = wKg < idealHealthyWeight ? parseFloat((idealHealthyWeight - wKg).toFixed(1)) : 0;
    const lbsToGainForIdeal = wKg < idealHealthyWeight ? Math.round((idealHealthyWeight - wKg) * 2.20462) : 0;

    // Weight Control Difference calculation
    let weightControlAction: 'lose' | 'gain' | 'maintain' = 'maintain';
    let weightDifferenceKg = 0;

    if (wKg > maxHealthyWeight) {
      weightControlAction = 'lose';
      weightDifferenceKg = kgToReduceForMaxNormal;
    } else if (wKg < minHealthyWeight) {
      weightControlAction = 'gain';
      weightDifferenceKg = kgToGainForMinNormal;
    }

    // Timeline Paces for Weight Adjustment
    const weeksAtMild = weightDifferenceKg > 0 ? Math.ceil(weightDifferenceKg / 0.25) : 0;
    const weeksAtModerate = weightDifferenceKg > 0 ? Math.ceil(weightDifferenceKg / 0.5) : 0;
    const weeksAtAggressive = weightDifferenceKg > 0 ? Math.ceil(weightDifferenceKg / 1.0) : 0;

    // 2. Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
    let bmr = 0;
    const isMale = sex === 'male';
    if (isMale) {
      bmr = (10 * wKg) + (6.25 * effectiveHeightCm) - (5 * aY) + 5;
    } else {
      bmr = (10 * wKg) + (6.25 * effectiveHeightCm) - (5 * aY) - 161;
      // Add pregnancy/lactation metabolic increases
      if (sex === 'pregnant_t2') bmr += 340;
      if (sex === 'pregnant_t3') bmr += 452;
      if (sex === 'lactating') bmr += 500;
    }

    // Harris-Benedict comparison BMR
    const hBmr = isMale
      ? 88.362 + (13.397 * wKg) + (4.799 * effectiveHeightCm) - (5.677 * aY)
      : 447.593 + (9.247 * wKg) + (3.098 * effectiveHeightCm) - (4.330 * aY);

    // 3. Activity Multiplier -> TDEE (Total Daily Energy Expenditure)
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activity]);

    // 4. Goal Adjustment
    let targetCalories = tdee;
    if (goal === 'mild_loss') targetCalories = tdee - 250;
    else if (goal === 'loss') targetCalories = tdee - 500;
    else if (goal === 'extreme_loss') targetCalories = tdee - 1000;
    else if (goal === 'mild_gain') targetCalories = tdee + 250;
    else if (goal === 'gain') targetCalories = tdee + 500;
    else if (goal === 'muscle') targetCalories = tdee + 350;

    // Minimum safe calorie threshold
    const minSafeCal = isMale ? 1500 : 1200;
    if (targetCalories < minSafeCal) targetCalories = minSafeCal;

    // 5. Macronutrients (Protein, Carbs, Fats)
    let proteinGrams = Math.round(wKg * (goal === 'muscle' ? 2.0 : 1.6));
    if (proteinGrams < 50) proteinGrams = 50;
    const proteinCal = proteinGrams * 4;

    const fatCal = targetCalories * 0.28;
    const fatGrams = Math.round(fatCal / 9);

    const carbCal = Math.max(0, targetCalories - proteinCal - fatCal);
    const carbGrams = Math.round(carbCal / 4);

    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    const activityWaterBonusL = activity === 'very_active' || activity === 'extra_active' ? 0.75 : 0.35;
    const waterLiters = parseFloat(((wKg * 0.035) + activityWaterBonusL).toFixed(1));
    const waterGlasses = Math.round((waterLiters * 1000) / 250);

    // 6. Age & Sex Specific Medical RDA Values
    const isSenior = aY >= 70;
    const isOlderAdult = aY >= 50;
    const isTeen = aY >= 13 && aY <= 18;
    const isChild = aY < 13;

    let calciumRda = 1000;
    if (isChild) calciumRda = 700;
    if (isTeen) calciumRda = 1300;
    if (isOlderAdult || sex.startsWith('pregnant')) calciumRda = 1200;

    let ironRda = isMale ? 8 : 18;
    if (isOlderAdult && !isMale) ironRda = 8;
    if (sex.startsWith('pregnant')) ironRda = 27;
    if (sex === 'lactating') ironRda = 9;

    let vitaminDRda = 600;
    if (isSenior) vitaminDRda = 800;

    let vitaminCRda = isMale ? 90 : 75;
    if (sex.startsWith('pregnant')) vitaminCRda = 85;
    if (sex === 'lactating') vitaminCRda = 120;

    let b12Rda = 2.4;
    if (sex.startsWith('pregnant')) b12Rda = 2.6;
    if (sex === 'lactating') b12Rda = 2.8;

    let folateRda = 400;
    if (sex.startsWith('pregnant')) folateRda = 600;
    if (sex === 'lactating') folateRda = 500;

    const potassiumRda = isMale ? 3400 : 2600;
    const sodiumLimitMg = isOlderAdult ? 1500 : 2300;
    let zincRda = isMale ? 11 : 8;
    if (sex.startsWith('pregnant')) zincRda = 11;
    let magRda = isMale ? 420 : 320;
    if (sex.startsWith('pregnant')) magRda = 350;

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory,
      bmiColor,
      bmiRisk,
      minHealthyWeight,
      maxHealthyWeight,
      idealHealthyWeight,
      kgToReduceForMaxNormal,
      lbsToReduceForMaxNormal,
      kgToReduceForIdeal,
      lbsToReduceForIdeal,
      kgToGainForMinNormal,
      lbsToGainForMinNormal,
      kgToGainForIdeal,
      lbsToGainForIdeal,
      weightControlAction,
      weightDifferenceKg,
      weeksAtMild,
      weeksAtModerate,
      weeksAtAggressive,
      bmr: Math.round(bmr),
      hBmr: Math.round(hBmr),
      tdee,
      targetCalories,
      proteinGrams,
      proteinCal,
      fatGrams,
      fatCal,
      carbGrams,
      carbCal,
      fiberGrams,
      waterLiters,
      waterGlasses,
      rda: {
        calciumRda,
        ironRda,
        vitaminDRda,
        vitaminCRda,
        b12Rda,
        folateRda,
        potassiumRda,
        sodiumLimitMg,
        zincRda,
        magRda,
      },
      lifeStageNote: isChild
        ? 'Pediatric Phase: Focus on adequate calcium, vitamin D, and high-quality protein for bone and brain development.'
        : isTeen
        ? 'Adolescent Phase: High caloric and calcium requirements for rapid growth spurts and bone mineral density building.'
        : isSenior
        ? 'Senior Phase (70+): Elevated protein requirement (1.2-1.5g/kg) is critical to prevent age-related sarcopenia and maintain bone density.'
        : sex.startsWith('pregnant')
        ? 'Maternal Phase: Higher folate (600mcg) and iron (27mg) intakes are crucial to support fetal development and prevent maternal anemia.'
        : 'Adult Maintenance Phase: Balanced macronutrients and micronutrient density support metabolic immunity and disease prevention.',
    };
  }, [age, sex, effectiveHeightCm, effectiveWeightKg, activity, goal]);

  // Recommended Foods dynamically filtered from active catalog based on BMI & Goal
  const recommendedFoods = useMemo(() => {
    const catalog = (contextFoods && contextFoods.length > 0) ? contextFoods : foodItems;
    const action = calculations.weightControlAction;

    if (action === 'lose' || goal.includes('loss')) {
      // High protein, high fiber, lower calorie items
      const filtered = catalog.filter((f) => {
        const cats = (f.category || []).map((c) => String(c).toLowerCase());
        return cats.includes('vegetables') || cats.includes('fruits') || cats.includes('legumes') || (f.nutrition?.protein || 0) >= 4;
      });
      return (filtered.length >= 4 ? filtered : catalog).slice(0, 4);
    } else if (action === 'gain' || goal.includes('gain') || goal === 'muscle') {
      // Nutrient dense, higher protein & energy foods
      const filtered = catalog.filter((f) => {
        const cats = (f.category || []).map((c) => String(c).toLowerCase());
        return cats.includes('nuts') || cats.includes('seeds') || cats.includes('dairy') || cats.includes('grains') || (f.nutrition?.protein || 0) >= 6;
      });
      return (filtered.length >= 4 ? filtered : catalog).slice(0, 4);
    }
    return catalog.slice(0, 4);
  }, [contextFoods, calculations.weightControlAction, goal]);

  // Recharts Macronutrient Pie Chart Data
  const macroChartData = useMemo(() => {
    const proteinPct = Math.round((calculations.proteinCal / calculations.targetCalories) * 100);
    const fatPct = Math.round((calculations.fatCal / calculations.targetCalories) * 100);
    const carbPct = Math.max(0, 100 - proteinPct - fatPct);

    return [
      { name: 'Protein', grams: calculations.proteinGrams, calories: calculations.proteinCal, percentage: proteinPct, color: '#f43f5e' },
      { name: 'Carbohydrates', grams: calculations.carbGrams, calories: calculations.carbCal, percentage: carbPct, color: '#f59e0b' },
      { name: 'Healthy Fats', grams: calculations.fatGrams, calories: Math.round(calculations.fatCal), percentage: fatPct, color: '#0284c7' },
    ];
  }, [calculations]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    exportNutritionCalculatorPDF({
      age,
      sex,
      heightCm: effectiveHeightCm,
      weightKg: effectiveWeightKg,
      activity,
      goal,
      bmi: calculations.bmi,
      bmiCategory: calculations.bmiCategory,
      bmiRisk: calculations.bmiRisk,
      minHealthyWeight: calculations.minHealthyWeight,
      maxHealthyWeight: calculations.maxHealthyWeight,
      idealHealthyWeight: calculations.idealHealthyWeight,
      weightControlAction: calculations.weightControlAction,
      weightDifferenceKg: calculations.weightDifferenceKg,
      bmr: calculations.bmr,
      tdee: calculations.tdee,
      targetCalories: calculations.targetCalories,
      proteinGrams: calculations.proteinGrams,
      proteinCal: calculations.proteinCal,
      carbGrams: calculations.carbGrams,
      carbCal: calculations.carbCal,
      fatGrams: calculations.fatGrams,
      fatCal: calculations.fatCal,
      fiberGrams: calculations.fiberGrams,
      waterLiters: calculations.waterLiters,
      waterGlasses: calculations.waterGlasses,
      lifeStageNote: calculations.lifeStageNote,
      rda: calculations.rda,
      recommendedFoods: recommendedFoods.map((f) => ({
        name: typeof f.name === 'string' ? f.name : (f.name?.en || 'Food Item'),
        category: f.category,
        protein: f.nutrition?.protein,
        calories: f.nutrition?.calories,
      })),
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              <span>Medical & RDA Precision Engine</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Clinical Nutrition & Daily Calorie Calculator
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
              Calculates your exact BMR, TDEE, WHO BMI status, weight control targets, target macronutrients, exercise plan, and RDA allowances based on global clinical standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              onClick={handleExportPdf}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export Formatted PDF
            </Button>
            <Button 
              onClick={() => setIsShareModalOpen(true)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Share Summary
            </Button>
            <Button 
              onClick={handlePrint}
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Biometric Inputs Form */}
        <Card className="lg:col-span-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg font-bold">Biometric Profile</CardTitle>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleUnitSystemChange('metric')}
                  className={`px-2.5 py-1 rounded-md transition-all ${unitSystem === 'metric' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitSystemChange('imperial')}
                  className={`px-2.5 py-1 rounded-md transition-all ${unitSystem === 'imperial' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Enter age, biological sex, measurements, and activity level
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Age & Sex */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs font-bold">Age (Years)</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={120}
                  value={age === 0 ? '' : age}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setAge(isNaN(val) ? 0 : val);
                  }}
                  className="rounded-xl border-slate-300 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sex" className="text-xs font-bold">Biological Sex / Stage</Label>
                <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                  <SelectTrigger id="sex" className="rounded-xl border-slate-300 text-xs font-bold">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs z-50">
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="pregnant_t1">Pregnant (1st Trimester)</SelectItem>
                    <SelectItem value="pregnant_t2">Pregnant (2nd Trimester)</SelectItem>
                    <SelectItem value="pregnant_t3">Pregnant (3rd Trimester)</SelectItem>
                    <SelectItem value="lactating">Lactating / Nursing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Height & Weight Inputs */}
            {unitSystem === 'metric' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="heightCm" className="text-xs font-bold">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      type="number"
                      min={50}
                      max={250}
                      value={heightCm === 0 ? '' : heightCm}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setHeightCm(isNaN(val) ? 0 : val);
                      }}
                      className="rounded-xl border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weightKg" className="text-xs font-bold">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      min={20}
                      max={300}
                      value={weightKg === 0 ? '' : weightKg}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setWeightKg(isNaN(val) ? 0 : val);
                      }}
                      className="rounded-xl border-slate-300 text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between px-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span>Imperial Equivalent:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.floor(Math.round((heightCm || 165) / 2.54) / 12)} ft {Math.round((heightCm || 165) / 2.54) % 12} in • {Math.round((weightKg || 60) * 2.20462)} lbs
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="heightFt" className="text-xs font-bold">Height (ft)</Label>
                    <Input
                      id="heightFt"
                      type="number"
                      min={2}
                      max={8}
                      value={heightFt === 0 ? '' : heightFt}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setHeightFt(isNaN(val) ? 0 : val);
                      }}
                      className="rounded-xl border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="heightIn" className="text-xs font-bold">Height (in)</Label>
                    <Input
                      id="heightIn"
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn === 0 ? '' : heightIn}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setHeightIn(isNaN(val) ? 0 : val);
                      }}
                      className="rounded-xl border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weightLbs" className="text-xs font-bold">Weight (lbs)</Label>
                    <Input
                      id="weightLbs"
                      type="number"
                      min={40}
                      max={600}
                      value={weightLbs === 0 ? '' : weightLbs}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setWeightLbs(isNaN(val) ? 0 : val);
                      }}
                      className="rounded-xl border-slate-300 text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between px-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span>Metric Equivalent:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {effectiveHeightCm} cm • {effectiveWeightKg} kg
                  </span>
                </div>
              </div>
            )}

            {/* Activity Level */}
            <div className="space-y-1.5">
              <Label htmlFor="activity" className="text-xs font-bold">Physical Activity Level</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
                <SelectTrigger id="activity" className="rounded-xl border-slate-300 text-xs font-bold">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs z-50">
                  <SelectItem value="sedentary">Sedentary (Little or no exercise, desk job)</SelectItem>
                  <SelectItem value="light">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderately Active (Moderate exercise 3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (Hard exercise 6-7 days/week)</SelectItem>
                  <SelectItem value="extra_active">Extra Active (Very intense exercise & physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health Goal */}
            <div className="space-y-1.5">
              <Label htmlFor="goal" className="text-xs font-bold">Health & Weight Goal</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
                <SelectTrigger id="goal" className="rounded-xl border-slate-300 text-xs font-bold">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs z-50">
                  <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                  <SelectItem value="mild_loss">Mild Weight Loss (-0.25 kg / 0.5 lbs per week)</SelectItem>
                  <SelectItem value="loss">Moderate Weight Loss (-0.5 kg / 1 lb per week)</SelectItem>
                  <SelectItem value="extreme_loss">Aggressive Weight Loss (-1.0 kg / 2 lbs per week)</SelectItem>
                  <SelectItem value="mild_gain">Mild Weight Gain (+0.25 kg / 0.5 lbs per week)</SelectItem>
                  <SelectItem value="gain">Weight Gain (+0.5 kg / 1 lb per week)</SelectItem>
                  <SelectItem value="muscle">Lean Muscle Hypertrophy (+350 kcal surplus)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Badge Input Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Effective Height:</span>
                <strong className="text-slate-800 dark:text-slate-200">{effectiveHeightCm} cm</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Effective Weight:</span>
                <strong className="text-slate-800 dark:text-slate-200">{effectiveWeightKg} kg ({Math.round(effectiveWeightKg * 2.20462)} lbs)</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Calculated Clinical Results with Framer Motion entry */}
        <motion.div 
          key={`${calculations.targetCalories}-${calculations.proteinGrams}-${effectiveWeightKg}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Top 4 Core Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* BMI Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-md text-center space-y-1 h-full flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  BMI Index
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white my-1">
                  {calculations.bmi}
                </div>
                <Badge className={`text-[10px] px-2 py-0.5 border ${calculations.bmiColor} mx-auto`}>
                  {calculations.bmiCategory}
                </Badge>
              </Card>
            </motion.div>

            {/* BMR Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-md text-center space-y-1 h-full flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  BMR Rate
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white my-1">
                  {calculations.bmr} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Basal Metabolic Rate</span>
              </Card>
            </motion.div>

            {/* TDEE Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-md text-center space-y-1 h-full flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  TDEE Total
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white my-1">
                  {calculations.tdee} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Daily Maintenance</span>
              </Card>
            </motion.div>

            {/* Target Calories Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-lg text-center space-y-1 h-full flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-100 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Goal Target
                </span>
                <div className="text-2xl font-black text-white my-1">
                  {calculations.targetCalories} <span className="text-xs font-normal text-emerald-200">kcal</span>
                </div>
                <span className="text-[10px] text-emerald-100/90 block">Daily Intake Target</span>
              </Card>
            </motion.div>
          </div>

          {/* Healthy Weight Range & Life Stage Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-bold">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>WHO Optimal Healthy Weight Range:</span>
              </span>
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-full font-black text-xs">
                {calculations.minHealthyWeight} kg – {calculations.maxHealthyWeight} kg (Ideal ~{calculations.idealHealthyWeight} kg)
              </span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
              <strong>Clinical Life-Stage Insight:</strong> {calculations.lifeStageNote}
            </p>
          </div>

          {/* Browser Smart Notification Engine */}
          <NutritionNotificationManager
            userWeightKg={effectiveWeightKg}
            userTdee={calculations.tdee}
            userGoal={goal}
            waterTargetLiters={calculations.waterLiters}
            proteinTargetGrams={calculations.proteinGrams}
          />

          {/* Expanded 6 Tabs Section */}
          <Tabs defaultValue="weight-planner" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger value="weight-planner" className="text-[11px] font-bold rounded-lg px-2 text-emerald-600 dark:text-emerald-400">
                Weight & Fat Planner
              </TabsTrigger>
              <TabsTrigger value="macros" className="text-[11px] font-bold rounded-lg px-2">
                Macros
              </TabsTrigger>
              <TabsTrigger value="weight-target" className="text-[11px] font-bold rounded-lg px-2">
                BMI Control
              </TabsTrigger>
              <TabsTrigger value="diet-plan" className="text-[11px] font-bold rounded-lg px-2">
                Food & Drinks
              </TabsTrigger>
              <TabsTrigger value="exercise-yoga" className="text-[11px] font-bold rounded-lg px-2">
                Fitness & Yoga
              </TabsTrigger>
              <TabsTrigger value="rda" className="text-[11px] font-bold rounded-lg px-2">
                RDA Table
              </TabsTrigger>
            </TabsList>

            {/* TAB: Weight & Fat Loss Planner */}
            <TabsContent value="weight-planner" className="mt-4">
              <WeightFatLossPlanner
                initialWeightKg={effectiveWeightKg}
                initialHeightCm={effectiveHeightCm}
                initialAge={age}
                initialSex={sex}
                initialTdee={calculations.tdee}
              />
            </TabsContent>

            {/* TAB 1: Macronutrients */}
            <TabsContent value="macros" className="mt-4 space-y-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-emerald-600" />
                      Daily Macronutrient Pie Chart Distribution
                    </h3>
                    <p className="text-xs text-slate-500">Visual breakdown of target caloric energy sources</p>
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-fit">
                    Total: {calculations.targetCalories} kcal/day
                  </Badge>
                </div>

                {/* Framer Motion Stacked Macro Ratio Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Macro Balance Progress Bar</span>
                    <span>100% Caloric Distribution</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${macroChartData[0].percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-rose-500 rounded-l-full shadow-sm"
                      title={`Protein ${macroChartData[0].percentage}%`}
                    />
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${macroChartData[1].percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                      className="h-full bg-amber-500 shadow-sm"
                      title={`Carbs ${macroChartData[1].percentage}%`}
                    />
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${macroChartData[2].percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                      className="h-full bg-sky-500 rounded-r-full shadow-sm"
                      title={`Fats ${macroChartData[2].percentage}%`}
                    />
                  </div>
                </div>

                {/* Pie Chart & Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]"
                  >
                    <div className="w-full h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart key={`${calculations.targetCalories}-${calculations.proteinGrams}`}>
                          <Pie
                            data={macroChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="calories"
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          >
                            {macroChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-0.5">
                                    <p className="font-extrabold flex items-center gap-1.5" style={{ color: data.color }}>
                                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }}></span>
                                      {data.name}
                                    </p>
                                    <p className="text-slate-200 font-medium"><strong>{data.grams}g</strong> ({data.calories} kcal)</p>
                                    <p className="text-slate-400 text-[10px]">{data.percentage}% of total calories</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Target</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                          {calculations.targetCalories}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">kcal</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-1 flex-wrap text-xs">
                      {macroChartData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          <span>{item.name} ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Protein Card */}
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                        <span className="text-xs font-bold uppercase">Protein</span>
                        <span className="text-[10px] font-black bg-rose-200/60 dark:bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-900 dark:text-rose-200">
                          {macroChartData[0].percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-black text-rose-950 dark:text-rose-100">
                        {calculations.proteinGrams}g
                      </div>
                      <span className="text-[11px] text-rose-600 dark:text-rose-300 block">
                        {calculations.proteinCal} kcal
                      </span>
                    </div>

                    {/* Carbohydrates Card */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                        <span className="text-xs font-bold uppercase">Carbs</span>
                        <span className="text-[10px] font-black bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">
                          {macroChartData[1].percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-black text-amber-950 dark:text-amber-100">
                        {calculations.carbGrams}g
                      </div>
                      <span className="text-[11px] text-amber-600 dark:text-amber-300 block">
                        {calculations.carbCal} kcal
                      </span>
                    </div>

                    {/* Healthy Fats Card */}
                    <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
                        <span className="text-xs font-bold uppercase">Fats</span>
                        <span className="text-[10px] font-black bg-sky-200/60 dark:bg-sky-900/60 px-1.5 py-0.5 rounded text-sky-900 dark:text-sky-200">
                          {macroChartData[2].percentage}%
                        </span>
                      </div>
                      <div className="text-2xl font-black text-sky-950 dark:text-sky-100">
                        {calculations.fatGrams}g
                      </div>
                      <span className="text-[11px] text-sky-600 dark:text-sky-300 block">
                        {Math.round(calculations.fatCal)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: BMI Weight Control Target */}
            <TabsContent value="weight-target" className="mt-4 space-y-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Comprehensive BMI Weight Control & Adjustment Analysis
                    </h3>
                    <p className="text-xs text-slate-500">WHO Clinical analysis for weight reduction (Overweight) and weight increase (Underweight)</p>
                  </div>
                  <Badge variant="outline" className={`text-xs w-fit ${calculations.bmiColor}`}>
                    {calculations.bmiCategory} (BMI {calculations.bmi})
                  </Badge>
                </div>

                {/* Sub-tab view toggle buttons */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAnalysisTab('current')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      analysisTab === 'current'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Active Profile ({calculations.weightControlAction === 'lose' ? 'Reduce Weight' : calculations.weightControlAction === 'gain' ? 'Increase Weight' : 'Fit Normal'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnalysisTab('overweight')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      analysisTab === 'overweight'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Overweight Analysis (Weight Reduction)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnalysisTab('underweight')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      analysisTab === 'underweight'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Underweight Analysis (Weight Increase)</span>
                  </button>
                </div>

                {/* Top 3 High Level Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Current Input Weight</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {effectiveWeightKg} <span className="text-sm font-normal text-slate-400">kg</span> ({Math.round(effectiveWeightKg * 2.20462)} lbs)
                    </div>
                    <span className="text-[10px] text-slate-400">Height: {effectiveHeightCm} cm | Age: {age} yrs</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">WHO Healthy Range</span>
                    <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                      {calculations.idealHealthyWeight} <span className="text-sm font-normal text-emerald-700 dark:text-emerald-400">kg</span> ({Math.round(calculations.idealHealthyWeight * 2.20462)} lbs)
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-300">Min: {calculations.minHealthyWeight} kg – Max: {calculations.maxHealthyWeight} kg</span>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${
                    calculations.weightControlAction === 'lose' 
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                      : calculations.weightControlAction === 'gain'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-900 dark:text-blue-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <span className="text-[11px] font-bold uppercase opacity-80">
                      {calculations.weightControlAction === 'lose' ? 'Target Weight to Lose' : calculations.weightControlAction === 'gain' ? 'Target Weight to Gain' : 'Healthy Fit Status'}
                    </span>
                    <div className="text-2xl font-black flex items-center gap-1">
                      {calculations.weightControlAction === 'lose' && <TrendingDown className="w-5 h-5 text-amber-600" />}
                      {calculations.weightControlAction === 'gain' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      {calculations.weightControlAction === 'maintain' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      <span>
                        {calculations.weightDifferenceKg === 0 
                          ? 'Optimal Fit!' 
                          : `${calculations.weightDifferenceKg} kg (${Math.round(calculations.weightDifferenceKg * 2.20462)} lbs)`}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-80">{calculations.bmiRisk}</span>
                  </div>
                </div>

                {/* VIEW 1: ACTIVE PROFILE / CURRENT */}
                {analysisTab === 'current' && (
                  <div className="space-y-4">
                    {calculations.weightControlAction === 'lose' ? (
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                          <TrendingDown className="w-4 h-4 text-amber-600" />
                          <span>OVERWEIGHT CLINICAL ANALYSIS: REDUCTION TARGET</span>
                        </div>
                        <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                          Your current weight ({effectiveWeightKg} kg) places your BMI at <strong>{calculations.bmi}</strong> ({calculations.bmiCategory}). 
                          To transition into the WHO healthy standard range (BMI 18.5 – 24.9), you need to reduce a total of 
                          <strong className="text-amber-700 dark:text-amber-300"> {calculations.kgToReduceForMaxNormal} kg ({calculations.lbsToReduceForMaxNormal} lbs)</strong> to reach the upper normal limit ({calculations.maxHealthyWeight} kg), or 
                          <strong className="text-amber-700 dark:text-amber-300"> {calculations.kgToReduceForIdeal} kg ({calculations.lbsToReduceForIdeal} lbs)</strong> to hit the ideal mid-point ({calculations.idealHealthyWeight} kg).
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mild Pace (-250 kcal/day)</span>
                            <div className="text-lg font-black text-amber-600">~{calculations.weeksAtMild} Weeks</div>
                            <span className="text-[10px] text-slate-400">Safe, steady loss (-0.25 kg/wk)</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Recommended Pace (-500 kcal/day)</span>
                            <div className="text-lg font-black text-amber-700 dark:text-amber-300">~{calculations.weeksAtModerate} Weeks</div>
                            <span className="text-[10px] text-amber-600">Gold standard loss (-0.50 kg/wk)</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Aggressive Pace (-1000 kcal/day)</span>
                            <div className="text-lg font-black text-amber-600">~{calculations.weeksAtAggressive} Weeks</div>
                            <span className="text-[10px] text-slate-400">Strict deficit (-1.00 kg/wk)</span>
                          </div>
                        </div>
                      </div>
                    ) : calculations.weightControlAction === 'gain' ? (
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 space-y-3">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-extrabold text-xs">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span>UNDERWEIGHT CLINICAL ANALYSIS: INCREASE TARGET</span>
                        </div>
                        <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed">
                          Your current weight ({effectiveWeightKg} kg) places your BMI at <strong>{calculations.bmi}</strong> ({calculations.bmiCategory}). 
                          To achieve normal physiological function and optimal muscle/bone density, you need to increase a total of 
                          <strong className="text-blue-700 dark:text-blue-300"> {calculations.kgToGainForMinNormal} kg ({calculations.lbsToGainForMinNormal} lbs)</strong> to reach the minimum normal threshold ({calculations.minHealthyWeight} kg), or 
                          <strong className="text-blue-700 dark:text-blue-300"> {calculations.kgToGainForIdeal} kg ({calculations.lbsToGainForIdeal} lbs)</strong> to achieve the ideal mid-point ({calculations.idealHealthyWeight} kg).
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mild Surplus (+250 kcal/day)</span>
                            <div className="text-lg font-black text-blue-600">~{calculations.weeksAtMild} Weeks</div>
                            <span className="text-[10px] text-slate-400">Lean mass gain (+0.25 kg/wk)</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-300 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Recommended Surplus (+500 kcal/day)</span>
                            <div className="text-lg font-black text-blue-700 dark:text-blue-300">~{calculations.weeksAtModerate} Weeks</div>
                            <span className="text-[10px] text-blue-600">Balanced gain (+0.50 kg/wk)</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 text-center space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Hypertrophy Surplus (+750 kcal/day)</span>
                            <div className="text-lg font-black text-blue-600">~{calculations.weeksAtAggressive} Weeks</div>
                            <span className="text-[10px] text-slate-400">Muscle bulk gain (+0.75 kg/wk)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>OPTIMAL HEALTHY WEIGHT STATUS</span>
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                          🎉 Your BMI is <strong>{calculations.bmi}</strong>, placing you perfectly within the standard WHO Healthy Range ({calculations.minHealthyWeight} kg – {calculations.maxHealthyWeight} kg).
                          Maintain your caloric energy balance at <strong>{calculations.tdee} kcal/day</strong> with balanced protein, fiber, and physical activity.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW 2: OVERWEIGHT COMPREHENSIVE ANALYSIS */}
                {analysisTab === 'overweight' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/80 space-y-3">
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                        COMPREHENSIVE ANALYSIS: HOW MUCH WEIGHT TO REDUCE & ACTION PLAN
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        When body mass exceeds normal BMI thresholds (&ge;25.0), visceral adiposity causes systemic low-grade inflammation, arterial stiffness, and insulin resistance. 
                        Targeted weight loss reduces hemoglobin A1c, lowers systolic blood pressure by ~1 mmHg per kg lost, and alleviates knee joint strain.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-200 dark:border-slate-700 space-y-1">
                          <span className="font-extrabold text-amber-800 dark:text-amber-300 block">📉 Target Weight Reduction Needed</span>
                          <p className="text-slate-600 dark:text-slate-300">
                            • To reach upper normal BMI limit (24.9): <strong>{calculations.kgToReduceForMaxNormal > 0 ? calculations.kgToReduceForMaxNormal : '0 (Already within range)'} kg</strong> ({calculations.lbsToReduceForMaxNormal} lbs)<br />
                            • To reach ideal mid-point BMI (21.7): <strong>{calculations.kgToReduceForIdeal > 0 ? calculations.kgToReduceForIdeal : '0'} kg</strong> ({calculations.lbsToReduceForIdeal} lbs)
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-200 dark:border-slate-700 space-y-1">
                          <span className="font-extrabold text-amber-800 dark:text-amber-300 block">🔥 Caloric Deficit Target</span>
                          <p className="text-slate-600 dark:text-slate-300">
                            • Daily Caloric Deficit: <strong>-{calculations.tdee > 2000 ? 500 : 350} kcal/day</strong><br />
                            • Daily Intake Target: <strong>{Math.max(1200, calculations.tdee - 500)} kcal</strong><br />
                            • Estimated Duration: <strong>~{(calculations as any).weeksToReduceMod || 12} Weeks</strong> for complete transformation
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-100 dark:border-slate-700">
                          <strong className="text-amber-800 dark:text-amber-300 block mb-1">🥗 High Volume Fiber</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Consume spinach, broccoli, cucumbers, amla, and chia seeds to promote gastric fullness and delay ghrelin hunger spikes.</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-100 dark:border-slate-700">
                          <strong className="text-amber-800 dark:text-amber-300 block mb-1">🥩 Lean Muscle Retention</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Keep protein intake elevated at 1.6 - 2.0g per kg of target weight ({Math.round(calculations.idealHealthyWeight * 1.8)}g/day) to prevent muscle loss.</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-100 dark:border-slate-700">
                          <strong className="text-amber-800 dark:text-amber-300 block mb-1">🧘 Fat Oxidation Yoga</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Practice 12 rounds of Surya Namaskar and 15 mins of Kapalbhati daily to accelerate lipid metabolic turnover.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 3: UNDERWEIGHT COMPREHENSIVE ANALYSIS */}
                {analysisTab === 'underweight' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-300 dark:border-blue-800/80 space-y-3">
                      <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        COMPREHENSIVE ANALYSIS: HOW MUCH WEIGHT TO INCREASE & ACTION PLAN
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        When BMI drops below 18.5, the body experiences sarcopenia (muscle tissue breakdown), impaired immune cell production, low bone mineral density (osteopenia risk), and chronic fatigue. 
                        A structured caloric surplus combined with progressive resistance training builds high-density lean muscle tissue rather than excess body fat.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200 dark:border-slate-700 space-y-1">
                          <span className="font-extrabold text-blue-800 dark:text-blue-300 block">📈 Target Weight Increase Needed</span>
                          <p className="text-slate-600 dark:text-slate-300">
                            • To reach lower normal BMI limit (18.5): <strong>{calculations.kgToGainForMinNormal > 0 ? calculations.kgToGainForMinNormal : '0 (Already above limit)'} kg</strong> ({calculations.lbsToGainForMinNormal} lbs)<br />
                            • To reach ideal mid-point BMI (21.7): <strong>{calculations.kgToGainForIdeal > 0 ? calculations.kgToGainForIdeal : '0'} kg</strong> ({calculations.lbsToGainForIdeal} lbs)
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200 dark:border-slate-700 space-y-1">
                          <span className="font-extrabold text-blue-800 dark:text-blue-300 block">⚡ Caloric Surplus Target</span>
                          <p className="text-slate-600 dark:text-slate-300">
                            • Daily Caloric Surplus: <strong>+{500} kcal/day</strong> above TDEE<br />
                            • Daily Intake Target: <strong>{calculations.tdee + 500} kcal</strong><br />
                            • Estimated Duration: <strong>~{(calculations as any).weeksToGainMod || 10} Weeks</strong> to achieve optimal healthy weight
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                          <strong className="text-blue-800 dark:text-blue-300 block mb-1">🥜 Nutritious Calorie Density</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Incorporate almonds, walnuts, dates, whole milk shakes, peanut butter, avocados, and pure ghee into meals.</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                          <strong className="text-blue-800 dark:text-blue-300 block mb-1">🏋️ Hypertrophy Resistance Training</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Perform compound strength exercises (squats, deadlifts, overhead presses) 3-4 days/week to stimulate muscle hypertrophy.</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                          <strong className="text-blue-800 dark:text-blue-300 block mb-1">🧘 Digestive Stimulant Yoga</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">Practice Bhujangasana, Paschimottanasana, and Vajrasana (post-meal) to optimize nutrient digestion and absorption.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 3: Food & Drinks Plan */}
            <TabsContent value="diet-plan" className="mt-4 space-y-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Apple className="w-4 h-4 text-emerald-600" />
                      Personalized Food & Drinks Plan (To Increase vs Reduce)
                    </h3>
                    <p className="text-xs text-slate-500">Targeted foods and healthy beverages tailored to your BMI ({calculations.bmiCategory})</p>
                  </div>
                </div>

                {/* Grid: Foods to Increase vs Foods to Reduce */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foods to Increase */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Foods to INCREASE in Daily Diet
                    </h4>
                    <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                      {calculations.weightControlAction === 'lose' ? (
                        <>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>High-Fiber Vegetables:</strong> Spinach, broccoli, cauliflower, cucumber, gourd, tomatoes for high volume & satiety.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Lean Protein & Sprouts:</strong> Mung bean sprouts, lentils/dal, paneer/tofu, eggs, fish, chicken breast to maintain muscle.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Whole Grains:</strong> Oats, brown rice, millets (ragi, bajra), quinoa with slow-release complex carbs.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Antioxidant Berries & Citrus:</strong> Apples, amla, guava, oranges, berries for Vitamin C and immunity.</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Calorie & Nutrient-Dense Nuts:</strong> Almonds, walnuts, cashews, chia, flaxseeds, pumpkin seeds.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Healthy Fats & Dairy:</strong> Whole milk, curd, paneer, ghee, extra virgin olive oil, avocados.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Energy Dense Fruits & Smoothies:</strong> Bananas, dates, figs, mangoes, peanut butter oatmeal shakes.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span><strong>Complex Carbohydrate Meals:</strong> Sweet potatoes, brown rice, chickpeas, kidney beans (rajma).</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Foods to Reduce / Avoid */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-3">
                    <h4 className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Ban className="w-4 h-4 text-rose-600" />
                      Foods to REDUCE / LIMIT
                    </h4>
                    <ul className="text-xs text-rose-900 dark:text-rose-200 space-y-2">
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span><strong>Refined Sugars & Desserts:</strong> Bakery pastries, candies, sweetened ice creams, refined syrup desserts.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span><strong>Deep-Fried Snacks & Trans Fats:</strong> Samosas, french fries, potato chips, pakoras, re-used cooking oil.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span><strong>Ultra-Processed Packaged Foods:</strong> Instant noodles, maida (refined flour) bakery products, processed meats.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span><strong>High-Sodium Foods:</strong> Excessive table salt, commercial canned soups, pickles, sodium-laden fast food.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Healthy Drinks & Hydration Section */}
                <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                      <GlassWater className="w-4 h-4 text-sky-600" />
                      Recommended Hydration & Healthy Beverages ({calculations.waterLiters}L Target)
                    </h4>
                    <Badge className="bg-sky-500 text-white text-[10px]">
                      {calculations.waterGlasses} Glasses Daily
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5 text-emerald-500" /> Green Tea & Herbal Infusions
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Rich in epigallocatechin gallate (EGCG) antioxidants to stimulate fat oxidation and improve metabolic rate.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> Warm Chia Seed Detox Water
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Soaked chia seeds expand in stomach providing soluble fiber, reducing hunger cravings and regulating glucose spikes.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Spiced Buttermilk (Chaas) / Amla Shot
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Probiotic gut microbiome booster with digestive cumin and black salt. Low calorie and rich in electrolytes.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <ShieldX className="w-3.5 h-3.5 text-rose-500" /> Beverages to Avoid
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Carbonated soft drinks, commercial packaged fruit juices with added sugar, energy drinks, excessive alcohol.
                      </p>
                    </div>
                  </div>
                </div>

                {/* NutriGlobe Suggested Food Cards */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    Recommended NutriGlobe Foods for Your Goal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        item={food}
                        onViewDetails={(item) => setSelectedFood(item)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 4: Exercise & Yoga */}
            <TabsContent value="exercise-yoga" className="mt-4 space-y-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                      Physical Exercise & Yoga Asanas Program
                    </h3>
                    <p className="text-xs text-slate-500">Targeted activity routine to maintain fitness, boost BMR, and reach healthy BMI</p>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[10px]">
                    Clinical Activity Plan
                  </Badge>
                </div>

                {/* Exercise Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cardio & Aerobics */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span>Cardio & Aerobic Endurance</span>
                    </div>
                    <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-2 pt-1">
                      <li><strong>Brisk Walking:</strong> 10,000 steps daily (~350–400 kcal burn). Great for sustainable fat loss & heart health.</li>
                      <li><strong>Cycling / Jogging / Swimming:</strong> 30–45 mins, 4 days/week (~350–500 kcal burn). Boosts lung stamina.</li>
                      <li><strong>HIIT Workouts:</strong> 20 mins, 3 days/week (~250 kcal burn) for EPOC metabolic fat oxidation.</li>
                    </ul>
                  </div>

                  {/* Strength & Resistance */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-xs">
                      <Dumbbell className="w-4 h-4 text-rose-600" />
                      <span>Strength & Muscle Resistance</span>
                    </div>
                    <ul className="text-xs text-rose-950 dark:text-rose-200 space-y-2 pt-1">
                      <li><strong>Bodyweight Core:</strong> Squats, Push-ups, Lunges, Planks (3 sets of 12–15 reps).</li>
                      <li><strong>Dumbbell Training:</strong> 3–4 days/week to build lean muscle tissue and elevate resting BMR rate.</li>
                      <li><strong>Post-Exercise Recovery:</strong> 25–30g post-workout protein intake to rebuild muscle fiber.</li>
                    </ul>
                  </div>

                  {/* Targeted Yoga Asanas & Pranayama */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                      <Sun className="w-4 h-4 text-emerald-600" />
                      <span>Yoga Asanas & Pranayama</span>
                    </div>
                    <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-2 pt-1">
                      <li><strong>Surya Namaskar:</strong> 12 rounds daily (~150 kcal burn). Full-body flexibility and core activation.</li>
                      <li><strong>Bhujangasana & Dhanurasana:</strong> Cobra & Bow Poses to massage liver, kidneys, and stimulate digestion.</li>
                      <li><strong>Kapalbhati & Anulom Vilom:</strong> 10 mins daily breathwork to reduce stress cortisol and visceral fat.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 5: Medical RDA Table */}
            <TabsContent value="rda" className="mt-4 space-y-6">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    Age & Sex Recommended Dietary Allowances (RDA)
                  </h3>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                    USDA / ICMR Standard
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <th className="p-2.5 rounded-l-lg">Nutrient Name</th>
                        <th className="p-2.5">Calculated RDA</th>
                        <th className="p-2.5 rounded-r-lg">Clinical Function & Sources</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Calcium</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.calciumRda} mg</td>
                        <td className="p-2.5 text-slate-500">Bone density, muscle contraction (Dairy, Sesame, Spinach)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Iron</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.ironRda} mg</td>
                        <td className="p-2.5 text-slate-500">Hemoglobin oxygen transport (Legumes, Spinach, Jaggery)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Vitamin D3</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.vitaminDRda} IU</td>
                        <td className="p-2.5 text-slate-500">Immunity & calcium absorption (Sunlight, Mushrooms, Eggs)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Vitamin C</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.vitaminCRda} mg</td>
                        <td className="p-2.5 text-slate-500">Collagen synthesis & immunity (Amla, Guava, Citrus fruits)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Vitamin B12</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.b12Rda} mcg</td>
                        <td className="p-2.5 text-slate-500">Nerve health & RBC formation (Dairy, Eggs, Fortified foods)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Folate / Folic Acid</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.folateRda} mcg</td>
                        <td className="p-2.5 text-slate-500">DNA synthesis & neural tube support (Leafy greens, Pulses)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Potassium</td>
                        <td className="p-2.5 font-black text-emerald-600">{calculations.rda.potassiumRda} mg</td>
                        <td className="p-2.5 text-slate-500">Electrolyte balance & BP regulation (Coconut water, Bananas)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Sodium Limit</td>
                        <td className="p-2.5 font-black text-rose-600">&lt; {calculations.rda.sodiumLimitMg} mg</td>
                        <td className="p-2.5 text-slate-500">Upper safe limit for cardiovascular health</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* RDA Weight & Belly Fat Loss Planner Integration */}
              <WeightFatLossPlanner
                initialWeightKg={effectiveWeightKg}
                initialHeightCm={effectiveHeightCm}
                initialAge={age}
                initialSex={sex}
                initialTdee={calculations.tdee}
              />
            </TabsContent>
          </Tabs>

          {/* Amazon Affiliate Recommendation Widget */}
          <AmazonAdBanner 
            format="grid" 
            category="scales" 
            maxItems={2} 
            title="Amazon Recommended Food Scales & Protein for Macro Goals" 
          />
        </motion.div>
      </div>

      {/* Food Detail Modal */}
      <FoodDetail
        item={selectedFood}
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />

      {/* Shareable Daily Goals Image Card Modal */}
      <NutritionShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={{
          age,
          sex,
          weightKg: effectiveWeightKg,
          heightCm: effectiveHeightCm,
          goal,
          activity
        }}
        calculations={{
          ...calculations,
          bmi: String(calculations.bmi),
          waterLiters: String(calculations.waterLiters),
        }}
        rda={{
          fiber: `${calculations.fiberGrams}g`,
          calcium: `${calculations.rda.calciumRda}mg`,
          iron: `${calculations.rda.ironRda}mg`,
          vitaminD: `${calculations.rda.vitaminDRda}IU`,
          folate: `${calculations.rda.folateRda}mcg`,
          sodium: `<${calculations.rda.sodiumLimitMg}mg`,
          potassium: `${calculations.rda.potassiumRda}mg`,
          vitaminC: `${calculations.rda.vitaminCRda}mg`,
        }}
      />
    </div>
  );
}
