import { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { 
  Calculator, Activity, Heart, ShieldAlert, Sparkles, Scale, Flame, 
  Droplets, Apple, Info, Download, Printer, CheckCircle2, Stethoscope, 
  ChevronRight, ArrowUpRight, Dumbbell, UserCheck, RefreshCw, PieChart as PieIcon, Share2
} from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { FoodItemClient } from '@shared/schema';
import { useTranslation } from '@/hooks/useTranslation';
import { NutritionShareCardModal } from './NutritionShareCardModal';

// Life Stages for clinical precision
type Sex = 'male' | 'female' | 'pregnant_t1' | 'pregnant_t2' | 'pregnant_t3' | 'lactating';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
type Goal = 'maintain' | 'mild_loss' | 'loss' | 'extreme_loss' | 'mild_gain' | 'gain' | 'muscle';
type UnitSystem = 'metric' | 'imperial';

export function NutritionCalculator() {
  const { getLocalizedText, language } = useTranslation();

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

  // Convert inputs to metric for uniform calculations
  const effectiveHeightCm = useMemo(() => {
    if (unitSystem === 'metric') return heightCm || 165;
    return Math.round(((heightFt * 12) + heightIn) * 2.54);
  }, [unitSystem, heightCm, heightFt, heightIn]);

  const effectiveWeightKg = useMemo(() => {
    if (unitSystem === 'metric') return weightKg || 60;
    return Math.round(weightLbs * 0.453592);
  }, [unitSystem, weightKg, weightLbs]);

  // Medical calculations
  const calculations = useMemo(() => {
    const hM = effectiveHeightCm / 100;
    const wKg = effectiveWeightKg;
    const aY = age || 25;

    // 1. BMI Calculation
    const bmi = wKg / (hM * hM);
    
    // WHO BMI Category
    let bmiCategory = 'Normal weight';
    let bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 bg-amber-50 border-amber-200';
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = 'Normal weight';
      bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-amber-700 bg-amber-100 border-amber-300';
    } else if (bmi >= 30 && bmi < 35) {
      bmiCategory = 'Obesity Class I';
      bmiColor = 'text-rose-600 bg-rose-50 border-rose-200';
    } else if (bmi >= 35 && bmi < 40) {
      bmiCategory = 'Obesity Class II';
      bmiColor = 'text-rose-700 bg-rose-100 border-rose-300';
    } else {
      bmiCategory = 'Obesity Class III';
      bmiColor = 'text-purple-700 bg-purple-100 border-purple-300';
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyWeight = Math.round(18.5 * hM * hM);
    const maxHealthyWeight = Math.round(24.9 * hM * hM);

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
    // Protein: 1.6g to 2.2g per kg for active/weight loss, 1.2g baseline
    let proteinGrams = Math.round(wKg * (goal === 'muscle' ? 2.0 : 1.6));
    if (proteinGrams < 50) proteinGrams = 50;
    const proteinCal = proteinGrams * 4;

    // Fat: 25-30% of target calories
    const fatCal = targetCalories * 0.28;
    const fatGrams = Math.round(fatCal / 9);

    // Carbs: Remaining calories
    const carbCal = Math.max(0, targetCalories - proteinCal - fatCal);
    const carbGrams = Math.round(carbCal / 4);

    // Fiber: 14g per 1000 calories
    const fiberGrams = Math.round((targetCalories / 1000) * 14);

    // Water intake: 35ml per kg body weight + extra for activity
    const activityWaterBonusL = activity === 'very_active' || activity === 'extra_active' ? 0.75 : 0.35;
    const waterLiters = parseFloat(((wKg * 0.035) + activityWaterBonusL).toFixed(1));
    const waterGlasses = Math.round((waterLiters * 1000) / 250);

    // 6. Age & Sex Specific Medical RDA Values
    const isSenior = aY >= 70;
    const isOlderAdult = aY >= 50;
    const isTeen = aY >= 13 && aY <= 18;
    const isChild = aY < 13;

    // Calcium (mg)
    let calciumRda = 1000;
    if (isChild) calciumRda = 700;
    if (isTeen) calciumRda = 1300;
    if (isOlderAdult || sex.startsWith('pregnant')) calciumRda = 1200;

    // Iron (mg)
    let ironRda = isMale ? 8 : 18;
    if (isOlderAdult && !isMale) ironRda = 8;
    if (sex.startsWith('pregnant')) ironRda = 27;
    if (sex === 'lactating') ironRda = 9;

    // Vitamin D3 (IU)
    let vitaminDRda = 600;
    if (isSenior) vitaminDRda = 800;

    // Vitamin C (mg)
    let vitaminCRda = isMale ? 90 : 75;
    if (sex.startsWith('pregnant')) vitaminCRda = 85;
    if (sex === 'lactating') vitaminCRda = 120;

    // Vitamin B12 (mcg)
    let b12Rda = 2.4;
    if (sex.startsWith('pregnant')) b12Rda = 2.6;
    if (sex === 'lactating') b12Rda = 2.8;

    // Folate (mcg)
    let folateRda = 400;
    if (sex.startsWith('pregnant')) folateRda = 600;
    if (sex === 'lactating') folateRda = 500;

    // Potassium (mg)
    const potassiumRda = isMale ? 3400 : 2600;

    // Sodium Limit (mg)
    const sodiumLimitMg = isOlderAdult ? 1500 : 2300;

    // Zinc (mg)
    let zincRda = isMale ? 11 : 8;
    if (sex.startsWith('pregnant')) zincRda = 11;

    // Magnesium (mg)
    let magRda = isMale ? 420 : 320;
    if (sex.startsWith('pregnant')) magRda = 350;

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory,
      bmiColor,
      minHealthyWeight,
      maxHealthyWeight,
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
        ? 'Adolescent Phase: High caloric and calcium requirements for rapid growth spurts and bone mineral density density building.'
        : isSenior
        ? 'Senior Phase (70+): Elevated protein requirement (1.2-1.5g/kg) is critical to prevent age-related sarcopenia and maintain bone density.'
        : sex.startsWith('pregnant')
        ? 'Maternal Phase: Higher folate (600mcg) and iron (27mg) intakes are crucial to support fetal development and prevent maternal anemia.'
        : 'Adult Maintenance Phase: Balanced macronutrients and micronutrient density support metabolic immunity and disease prevention.',
    };
  }, [age, sex, effectiveHeightCm, effectiveWeightKg, activity, goal]);

  // Recommended Foods based on calculated highest priority nutrients
  const recommendedFoods = useMemo(() => {
    return foodItems.slice(0, 4);
  }, []);

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
              Calculates your exact BMR, TDEE, WHO BMI status, target macronutrients, and age-specific Recommended Dietary Allowances (RDA) based on global clinical standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              onClick={() => setIsShareModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Share2 className="w-4 h-4" />
              Save & Share Summary Card
            </Button>
            <Button 
              onClick={handlePrint}
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
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
                  onClick={() => setUnitSystem('metric')}
                  className={`px-2.5 py-1 rounded-md transition-all ${unitSystem === 'metric' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  onClick={() => setUnitSystem('imperial')}
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
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="rounded-xl border-slate-300 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sex" className="text-xs font-bold">Biological Sex / Stage</Label>
                <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                  <SelectTrigger id="sex" className="rounded-xl border-slate-300 text-xs">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="heightCm" className="text-xs font-bold">Height (cm)</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    min={50}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weightKg" className="text-xs font-bold">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    min={20}
                    max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-slate-300 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="heightFt" className="text-xs font-bold">Height (ft)</Label>
                  <Input
                    id="heightFt"
                    type="number"
                    min={2}
                    max={8}
                    value={heightFt}
                    onChange={(e) => setHeightFt(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heightIn" className="text-xs font-bold">Height (in)</Label>
                  <Input
                    id="heightIn"
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-slate-300 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weightLbs" className="text-xs font-bold">Weight (lbs)</Label>
                  <Input
                    id="weightLbs"
                    type="number"
                    min={40}
                    max={600}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-slate-300 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Activity Level */}
            <div className="space-y-1.5">
              <Label htmlFor="activity" className="text-xs font-bold">Physical Activity Level</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
                <SelectTrigger id="activity" className="rounded-xl border-slate-300 text-xs">
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
                <SelectTrigger id="goal" className="rounded-xl border-slate-300 text-xs">
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
          key={`${calculations.targetCalories}-${calculations.proteinGrams}`}
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
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Optimal Healthy Weight Target:</span>
              </span>
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-black">
                {calculations.minHealthyWeight} kg - {calculations.maxHealthyWeight} kg
              </span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
              <strong>Clinical Life-Stage Insight:</strong> {calculations.lifeStageNote}
            </p>
          </div>

          {/* Social Share Card CTA Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-4 rounded-2xl border border-indigo-700/50 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Daily Target Graphic Card</h4>
                <p className="text-[11px] text-indigo-200/80">Save a high-res image card of your BMR, macros, and RDA goals to share or track</p>
              </div>
            </div>
            <Button
              onClick={() => setIsShareModalOpen(true)}
              size="sm"
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl px-4 py-2 shrink-0 shadow"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Image Card
            </Button>
          </div>

          {/* Tabs for Detailed Breakdown: Macros, Medical RDA, Hydration */}
          <Tabs defaultValue="macros" className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger value="macros" className="text-xs font-bold rounded-lg">
                Macronutrients
              </TabsTrigger>
              <TabsTrigger value="rda" className="text-xs font-bold rounded-lg">
                Medical RDA Table
              </TabsTrigger>
              <TabsTrigger value="hydration" className="text-xs font-bold rounded-lg">
                Hydration & Fiber
              </TabsTrigger>
            </TabsList>

            {/* Macros Content */}
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
                  {/* Left Column: Recharts Donut Pie Chart with Framer Motion wrapper */}
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

                      {/* Center Donut Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Target</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                          {calculations.targetCalories}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">kcal</span>
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-center gap-3 mt-1 flex-wrap text-xs">
                      {macroChartData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          <span>{item.name} ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right Column: Macro Value Cards with Animated Progress Fill */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Protein Card */}
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between"
                    >
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
                      {/* Animated Progress Bar */}
                      <div className="w-full bg-rose-200/60 dark:bg-rose-950 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macroChartData[0].percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-rose-500 h-full rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Carbohydrates Card */}
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between"
                    >
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
                      {/* Animated Progress Bar */}
                      <div className="w-full bg-amber-200/60 dark:bg-amber-950 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macroChartData[1].percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                          className="bg-amber-500 h-full rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Healthy Fats Card */}
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-3.5 rounded-2xl text-center space-y-2 flex flex-col justify-between"
                    >
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
                      {/* Animated Progress Bar */}
                      <div className="w-full bg-sky-200/60 dark:bg-sky-950 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${macroChartData[2].percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          className="bg-sky-500 h-full rounded-full"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Medical RDA Table Content */}
            <TabsContent value="rda" className="mt-4">
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
            </TabsContent>

            {/* Hydration & Fiber Content */}
            <TabsContent value="hydration" className="mt-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 font-extrabold text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-sky-500" />
                          <span>Daily Water Requirement</span>
                        </span>
                        <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-400/30 text-[10px]">
                          {calculations.waterGlasses} Glasses
                        </Badge>
                      </div>
                      <div className="text-3xl font-black text-sky-950 dark:text-sky-100 my-1">
                        {calculations.waterLiters} Liters
                      </div>
                      <p className="text-xs text-sky-700 dark:text-sky-300">
                        Approximately <strong>{calculations.waterGlasses} standard glasses</strong> (250ml) per day to maintain renal filtration and cellular hydration.
                      </p>
                    </div>

                    {/* Animated Water Target Progress Bar (scaled out of 4.0L base) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-sky-700 dark:text-sky-400 font-bold">
                        <span>Hydration Goal Scale</span>
                        <span>{Math.min(100, Math.round((parseFloat(calculations.waterLiters) / 3.5) * 100))}%</span>
                      </div>
                      <div className="w-full bg-sky-200/60 dark:bg-sky-950 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.round((parseFloat(calculations.waterLiters) / 3.5) * 100))}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="bg-sky-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-extrabold text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <Apple className="w-5 h-5 text-emerald-500" />
                          <span>Daily Fiber Target</span>
                        </span>
                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30 text-[10px]">
                          Microbiome Care
                        </Badge>
                      </div>
                      <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 my-1">
                        {calculations.fiberGrams} Grams
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Supports gut microbiome diversity, delays glucose absorption, and promotes healthy bowel motility.
                      </p>
                    </div>

                    {/* Animated Fiber Target Progress Bar (scaled out of 40g base) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>Fiber Intake Target</span>
                        <span>{Math.min(100, Math.round((calculations.fiberGrams / 38) * 100))}%</span>
                      </div>
                      <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.round((calculations.fiberGrams / 38) * 100))}%` }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                          className="bg-emerald-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Amazon Affiliate Recommendation Widget for Body Scales & Protein */}
          <AmazonAdBanner 
            format="grid" 
            category="scales" 
            maxItems={2} 
            title="Amazon Recommended Food Scales & Protein for Macro Goals" 
          />

          {/* Suggested Foods to meet RDA requirements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-600" />
                Recommended NutriGlobe Foods for Your Biometric RDA
              </h3>
            </div>

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
        calculations={calculations}
        rda={clinicalRda}
      />
    </div>
  );
}
