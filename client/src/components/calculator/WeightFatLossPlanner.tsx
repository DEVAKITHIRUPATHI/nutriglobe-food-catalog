import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, Target, Calendar, Dumbbell, TrendingDown, TrendingUp, Sparkles, 
  Info, Activity, ShieldAlert, HeartPulse, Scale, CheckCircle2, Zap, ArrowRight,
  Apple, Droplets, Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeightFatLossPlannerProps {
  initialWeightKg?: number;
  initialHeightCm?: number;
  initialAge?: number;
  initialSex?: string;
  initialTdee?: number;
}

export function WeightFatLossPlanner({
  initialWeightKg = 70,
  initialHeightCm = 170,
  initialAge = 28,
  initialSex = 'female',
  initialTdee = 2100,
}: WeightFatLossPlannerProps) {
  // Mode: 'loss' or 'gain'
  const [mode, setMode] = useState<'loss' | 'gain'>('loss');

  // Input states
  const [currentWeight, setCurrentWeight] = useState<number>(initialWeightKg);
  const [targetWeight, setTargetWeight] = useState<number>(mode === 'loss' ? Math.max(45, initialWeightKg - 6) : initialWeightKg + 5);
  const [waistCm, setWaistCm] = useState<number>(mode === 'loss' ? 86 : 74);
  const [estimatedBodyFatPct, setEstimatedBodyFatPct] = useState<number>(mode === 'loss' ? 26 : 18);
  const [paceDeficit, setPaceDeficit] = useState<number>(500); // 300, 500, 750, 1000 kcal/day

  // Automatically adjust default target weight when mode flips
  const handleModeChange = (newMode: 'loss' | 'gain') => {
    setMode(newMode);
    if (newMode === 'loss') {
      setTargetWeight(Math.max(40, currentWeight - 6));
      setPaceDeficit(500);
    } else {
      setTargetWeight(currentWeight + 5);
      setPaceDeficit(400); // surplus
    }
  };

  // Calculations
  const results = useMemo(() => {
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const kcalPerKgFat = 7700; // ~7700 kcal per 1kg of body fat
    const totalKcalRequired = weightDiff * kcalPerKgFat;

    const dailyAdjustment = Math.max(150, paceDeficit); // daily deficit or surplus
    const daysToGoal = Math.ceil(totalKcalRequired / dailyAdjustment);
    const weeksToGoal = parseFloat((daysToGoal / 7).toFixed(1));
    const monthsToGoal = parseFloat((daysToGoal / 30.4).toFixed(1));

    // Calculate Completion Date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToGoal);
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Body Composition & Belly Fat Analysis
    const totalFatMassKg = parseFloat((currentWeight * (estimatedBodyFatPct / 100)).toFixed(1));
    const leanBodyMassKg = parseFloat((currentWeight - totalFatMassKg).toFixed(1));

    // Est. Belly / Abdominal Visceral Fat portion (~35-45% of total body fat for average adult)
    const estBellyFatKg = parseFloat((totalFatMassKg * 0.38).toFixed(1));

    // Target Fat Reduction
    const fatToBurnKg = mode === 'loss' ? Math.min(totalFatMassKg, weightDiff) : 0;
    const estBellyFatReducedKg = mode === 'loss' ? parseFloat((fatToBurnKg * 0.38).toFixed(1)) : 0;

    // Daily Calorie Target
    const baseTdee = initialTdee || 2100;
    const targetCalories = mode === 'loss'
      ? Math.max(1200, baseTdee - dailyAdjustment)
      : baseTdee + dailyAdjustment;

    // Protein Requirement Strategy (g/kg of body weight)
    // Higher protein (1.8 - 2.2 g/kg) during weight loss to prevent muscle breakdown
    // Moderate/High protein (1.6 - 2.0 g/kg) during weight gain for muscle synthesis
    const proteinFactor = mode === 'loss' ? 2.0 : 1.8;
    const dailyProteinGrams = Math.round(currentWeight * proteinFactor);
    const proteinCalories = dailyProteinGrams * 4;
    const perMealProtein = Math.round(dailyProteinGrams / 4); // 4 meals

    // Timeline Breakdown (Week 1, 2, 4, 8, Goal)
    const weeklyRateKg = (dailyAdjustment * 7) / kcalPerKgFat; // kg per week
    const timeline = [];
    const maxWeeks = Math.min(52, Math.ceil(weeksToGoal));

    const keyWeeks = Array.from(new Set([1, 2, 4, 8, 12, 16, 24, maxWeeks])).filter(w => w <= maxWeeks);
    if (!keyWeeks.includes(maxWeeks) && maxWeeks > 0) keyWeeks.push(maxWeeks);

    for (const w of keyWeeks) {
      const changeKg = parseFloat((weeklyRateKg * w).toFixed(1));
      const projectedW = mode === 'loss' 
        ? Math.max(targetWeight, parseFloat((currentWeight - changeKg).toFixed(1)))
        : parseFloat((currentWeight + changeKg).toFixed(1));
      
      const projectedFatBurned = mode === 'loss' ? Math.min(weightDiff, changeKg) : 0;
      const projectedBellyFatBurned = mode === 'loss' ? parseFloat((projectedFatBurned * 0.38).toFixed(1)) : 0;

      const wDate = new Date();
      wDate.setDate(wDate.getDate() + w * 7);

      timeline.push({
        week: w,
        date: wDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projectedWeight: projectedW,
        fatBurned: projectedFatBurned,
        bellyFatBurned: projectedBellyFatBurned,
      });
    }

    return {
      weightDiff,
      totalKcalRequired,
      dailyAdjustment,
      daysToGoal,
      weeksToGoal,
      monthsToGoal,
      formattedDate,
      totalFatMassKg,
      leanBodyMassKg,
      estBellyFatKg,
      fatToBurnKg,
      estBellyFatReducedKg,
      targetCalories,
      dailyProteinGrams,
      proteinCalories,
      perMealProtein,
      weeklyRateKg: parseFloat(weeklyRateKg.toFixed(2)),
      timeline,
    };
  }, [currentWeight, targetWeight, estimatedBodyFatPct, paceDeficit, mode, initialTdee]);

  return (
    <Card className="border-emerald-200 dark:border-emerald-900 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Header Banner */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 border-b border-emerald-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  Clinical Weight & Fat Reduction Timeline Planner
                </CardTitle>
                <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black">
                  7700 kcal/kg Standard
                </Badge>
              </div>
              <CardDescription className="text-xs text-emerald-200/80 mt-1">
                Precision Days-to-Goal calculator, belly/visceral fat burn breakdown, & protein macro strategy
              </CardDescription>
            </div>
          </div>

          {/* Loss / Gain Mode Switcher Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => handleModeChange('loss')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'loss'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Weight & Fat Loss
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('gain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                mode === 'gain'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Weight & Muscle Gain
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Current Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="cw" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Current Weight (kg)
            </Label>
            <Input
              id="cw"
              type="number"
              min={30}
              max={250}
              value={currentWeight}
              onChange={(e) => setCurrentWeight(Number(e.target.value) || 70)}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
            <span className="text-[10px] text-slate-500 font-medium">
              = {Math.round(currentWeight * 2.20462)} lbs
            </span>
          </div>

          {/* Target Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="tw" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Goal Weight (kg)
            </Label>
            <Input
              id="tw"
              type="number"
              min={30}
              max={250}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value) || 60)}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
            <span className="text-[10px] text-slate-500 font-medium">
              Target Difference: <strong className="text-emerald-600">{results.weightDiff} kg</strong> ({Math.round(results.weightDiff * 2.20462)} lbs)
            </span>
          </div>

          {/* Est Body Fat % or Waist */}
          <div className="space-y-1.5">
            <Label htmlFor="bf" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Est. Body Fat %
            </Label>
            <Input
              id="bf"
              type="number"
              min={5}
              max={60}
              value={estimatedBodyFatPct}
              onChange={(e) => setEstimatedBodyFatPct(Number(e.target.value) || 20)}
              className="rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
            <span className="text-[10px] text-slate-500 font-medium">
              Belly Fat portion: ~{results.estBellyFatKg} kg
            </span>
          </div>

          {/* Daily Pace Deficit / Surplus */}
          <div className="space-y-1.5">
            <Label htmlFor="pace" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {mode === 'loss' ? 'Daily Calorie Deficit' : 'Daily Calorie Surplus'}
            </Label>
            <Select value={String(paceDeficit)} onValueChange={(v) => setPaceDeficit(Number(v))}>
              <SelectTrigger id="pace" className="rounded-xl font-bold text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs z-50">
                {mode === 'loss' ? (
                  <>
                    <SelectItem value="300">Mild Deficit (-300 kcal/day | ~0.27 kg/wk)</SelectItem>
                    <SelectItem value="500">Standard Gold Deficit (-500 kcal/day | ~0.45 kg/wk)</SelectItem>
                    <SelectItem value="750">Accelerated Deficit (-750 kcal/day | ~0.68 kg/wk)</SelectItem>
                    <SelectItem value="1000">Aggressive Deficit (-1000 kcal/day | ~0.91 kg/wk)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="250">Lean Bulk Surplus (+250 kcal/day | ~0.23 kg/wk)</SelectItem>
                    <SelectItem value="400">Standard Muscle Surplus (+400 kcal/day | ~0.36 kg/wk)</SelectItem>
                    <SelectItem value="600">Hypertrophy Bulk (+600 kcal/day | ~0.55 kg/wk)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <span className="text-[10px] text-slate-500 font-medium">
              Target Daily Intake: <strong className="text-emerald-600">{results.targetCalories} kcal</strong>
            </span>
          </div>
        </div>

        {/* Highlighted Results Banner */}
        <motion.div 
          key={`${results.daysToGoal}-${results.targetCalories}-${mode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Days & Date Result */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-1 shadow-md border border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-300 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              Estimated Timeline
            </span>
            <div className="text-3xl font-black text-white">
              {results.daysToGoal} <span className="text-sm font-bold text-emerald-300">Days</span>
            </div>
            <span className="text-xs text-emerald-200 font-medium block">
              (~{results.weeksToGoal} weeks / {results.monthsToGoal} months)
            </span>
            <div className="pt-2 border-t border-emerald-800/80 text-[11px] text-amber-200 font-bold">
              🎯 Goal Achievement Date: {results.formattedDate}
            </div>
          </div>

          {/* Fat Burn / Muscle Mass Result */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              {mode === 'loss' ? 'Fat & Belly Loss' : 'Muscle Mass Expansion'}
            </span>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'loss' ? `${results.fatToBurnKg} kg` : `+${results.weightDiff} kg`}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                {mode === 'loss' 
                  ? `Est. Belly Fat Reduction: ~${results.estBellyFatReducedKg} kg` 
                  : `Target Lean Tissue: ~${(results.weightDiff * 0.7).toFixed(1)} kg`}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              Weekly Rate: {results.weeklyRateKg} kg / week
            </span>
          </div>

          {/* Protein Requirement Strategy */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-rose-500" />
              Target Daily Protein
            </span>
            <div>
              <div className="text-2xl font-black text-rose-950 dark:text-rose-100">
                {results.dailyProteinGrams} g <span className="text-xs font-normal text-rose-500">({results.proteinCalories} kcal)</span>
              </div>
              <span className="text-xs text-rose-700 dark:text-rose-300 block font-medium">
                ~{results.perMealProtein}g Protein across 4 meals
              </span>
            </div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
              Strategy: {mode === 'loss' ? '2.0g/kg (Muscle Sparing Deficit)' : '1.8g/kg (Muscle Hypertrophy)'}
            </span>
          </div>

          {/* Caloric Energy Budget */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              Daily Intake Target
            </span>
            <div>
              <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {results.targetCalories} <span className="text-xs font-normal text-emerald-600">kcal/day</span>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 block font-medium">
                TDEE Base ({initialTdee} kcal) {mode === 'loss' ? ` - ${results.dailyAdjustment}` : ` + ${results.dailyAdjustment}`}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
              Total Energy Deficit: {results.totalKcalRequired.toLocaleString()} kcal
            </span>
          </div>
        </motion.div>

        {/* Visceral & Belly Fat Burn Protocol Box */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Targeted Visceral & Belly Fat Burn Clinical Recommendations
            </h4>
            <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold">
              Metabolic Science
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Apple className="w-3.5 h-3.5 text-amber-600" /> Anti-Inflammatory Dietary Protocol
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Cut refined carbohydrates and industrial seed oils. Increase soluble fiber (chia, flaxseeds, legumes) which binds to bile acids, reducing belly visceral adiposity storage.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-amber-600" /> Core Activation & EPOC Exercise
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Combine 20 mins of high-intensity interval training (HIIT) with stomach vacuum poses, planks, and Kapalbhati breathwork to increase abdominal tissue blood flow and lipid oxidation.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-200 dark:border-slate-700 space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-600" /> Cortisol & Insulin Control
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                High stress cortisol directly signals belly fat accumulation. Ensure 7.5 hours of sleep, limit late-night snacking, and maintain a consistent 12-hour overnight digestive fasting window.
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Timeline Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Projected Milestone Progression Table
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Based on {results.dailyAdjustment} kcal/day {mode === 'loss' ? 'deficit' : 'surplus'}
            </span>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Timeline Milestone</th>
                  <th className="p-3">Est. Date</th>
                  <th className="p-3">Projected Weight</th>
                  <th className="p-3">{mode === 'loss' ? 'Total Fat Burned' : 'Weight Gained'}</th>
                  <th className="p-3">{mode === 'loss' ? 'Belly Fat Reduced' : 'Lean Tissue Build'}</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {results.timeline.map((row, idx) => (
                  <tr key={row.week} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Week {row.week}</td>
                    <td className="p-3 text-slate-500">{row.date}</td>
                    <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                      {row.projectedWeight} kg <span className="text-[10px] text-slate-400 font-normal">({Math.round(row.projectedWeight * 2.20462)} lbs)</span>
                    </td>
                    <td className="p-3 font-bold text-rose-600">
                      {mode === 'loss' ? `-${row.fatBurned} kg fat` : `+${row.fatBurned || (row.week * results.weeklyRateKg).toFixed(1)} kg`}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {mode === 'loss' ? `~${row.bellyFatBurned} kg belly fat` : `~${((row.week * results.weeklyRateKg) * 0.7).toFixed(1)} kg lean muscle`}
                    </td>
                    <td className="p-3 text-right">
                      {row.week === results.weeksToGoal || idx === results.timeline.length - 1 ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">Goal Reached!</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-700">In Progress</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
