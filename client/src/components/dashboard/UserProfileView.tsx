import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, Flame, Dumbbell, Wheat, Droplets, HeartPulse, Sparkles, 
  ShieldCheck, Check, Save, Activity, Scale, Heart, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserNutritionProfile, updateUserNutritionProfile } from '@/lib/idb';

interface UserProfileViewProps {
  profile: UserNutritionProfile;
  onProfileUpdated: (updated: UserNutritionProfile) => void;
}

const DIETARY_OPTIONS = [
  { id: 'balanced', label: 'Balanced Wellness', desc: 'Standard clinical distribution for general health', cal: 2000, p: 75, c: 250, f: 65, fib: 30 },
  { id: 'high-protein', label: 'High Protein & Fitness', desc: 'Optimized for lean mass, hypertrophy, and recovery', cal: 2200, p: 140, c: 190, f: 60, fib: 32 },
  { id: 'plant-based', label: 'Plant-Based & Vegan', desc: 'Phytonutrient-dense whole food plant nourishment', cal: 1950, p: 70, c: 270, f: 55, fib: 40 },
  { id: 'low-carb', label: 'Low Carb & Keto Friendly', desc: 'Lower glycemic impact, metabolic flexibility', cal: 1850, p: 95, c: 75, f: 110, fib: 28 },
  { id: 'heart-health', label: 'Cardiovascular & DASH', desc: 'Low sodium, high potassium, rich in heart-healthy fats', cal: 1900, p: 80, c: 240, f: 55, fib: 35 },
  { id: 'gut-health', label: 'Microbiome & Gut Care', desc: 'Prebiotic and probiotic focused with soluble fibers', cal: 2000, p: 80, c: 230, f: 65, fib: 42 }
] as const;

const ALLERGEN_OPTIONS = [
  'Gluten / Celiac',
  'Dairy & Lactose',
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Soy',
  'Eggs',
  'Sesame',
  'Sulfites'
];

export function UserProfileView({ profile, onProfileUpdated }: UserProfileViewProps) {
  const { toast } = useToast();

  // Local form states
  const [displayName, setDisplayName] = useState(profile.displayName || 'Health Explorer');
  const [dietaryFocus, setDietaryFocus] = useState(profile.dietaryFocus || 'balanced');
  const [calorieTarget, setCalorieTarget] = useState(profile.calorieTarget || 2000);
  const [proteinTarget, setProteinTarget] = useState(profile.proteinTarget || 75);
  const [carbsTarget, setCarbsTarget] = useState(profile.carbsTarget || 250);
  const [fatTarget, setFatTarget] = useState(profile.fatTarget || 65);
  const [fiberTarget, setFiberTarget] = useState(profile.fiberTarget || 30);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(profile.allergens || []);

  // Biometrics
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>('moderate');
  const [isSaving, setIsSaving] = useState(false);

  // Live BMI Calculation
  const bmiData = useMemo(() => {
    if (!heightCm || !weightKg) return { bmi: 22.5, label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    const hMeters = heightCm / 100;
    const val = Math.round((weightKg / (hMeters * hMeters)) * 10) / 10;
    if (val < 18.5) return { bmi: val, label: 'Underweight', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' };
    if (val < 25.0) return { bmi: val, label: 'Optimal / Normal', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    if (val < 30.0) return { bmi: val, label: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' };
    return { bmi: val, label: 'Obese (Class I+)', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' };
  }, [heightCm, weightKg]);

  // Live BMR & TDEE (Mifflin-St Jeor)
  const energyCalculations = useMemo(() => {
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
    bmr = Math.round(bmr);

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725
    };
    const tdee = Math.round(bmr * multipliers[activityLevel]);
    return { bmr, tdee };
  }, [age, gender, weightKg, heightCm, activityLevel]);

  // Handle Dietary Preset Apply
  const applyDietaryPreset = (option: typeof DIETARY_OPTIONS[number]) => {
    setDietaryFocus(option.id);
    setCalorieTarget(option.cal);
    setProteinTarget(option.p);
    setCarbsTarget(option.c);
    setFatTarget(option.f);
    setFiberTarget(option.fib);
  };

  // Toggle Allergen
  const toggleAllergen = (item: string) => {
    setSelectedAllergens(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Sync TDEE to Calorie Target
  const applyTdeeTarget = () => {
    setCalorieTarget(energyCalculations.tdee);
    // Standard 40/30/30 or focus ratio
    const pGrams = Math.round((energyCalculations.tdee * 0.25) / 4);
    const cGrams = Math.round((energyCalculations.tdee * 0.45) / 4);
    const fGrams = Math.round((energyCalculations.tdee * 0.30) / 9);
    setProteinTarget(pGrams);
    setCarbsTarget(cGrams);
    setFatTarget(fGrams);
    toast({
      title: 'TDEE Targets Applied',
      description: `Target updated to ${energyCalculations.tdee} kcal with balanced macronutrient targets.`
    });
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: UserNutritionProfile = {
        ...profile,
        displayName: displayName.trim() || 'Health Explorer',
        calorieTarget: Number(calorieTarget) || 2000,
        proteinTarget: Number(proteinTarget) || 75,
        carbsTarget: Number(carbsTarget) || 250,
        fatTarget: Number(fatTarget) || 65,
        fiberTarget: Number(fiberTarget) || 30,
        dietaryFocus,
        allergens: selectedAllergens,
        updatedAt: Date.now()
      };

      await updateUserNutritionProfile(updated);
      onProfileUpdated(updated);

      toast({
        title: 'Profile Updated',
        description: 'Your clinical nutrition targets and profile biometrics have been saved successfully.'
      });
    } catch (e) {
      console.error('Failed to save profile:', e);
      toast({
        title: 'Error Saving Profile',
        description: 'Could not write to local storage. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="user-profile-view" className="space-y-6">
      {/* Profile Overview Hero Card */}
      <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {displayName}
                  </h2>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                    Verified User
                  </Badge>
                </div>
                <p className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                  <span>Focus:</span>
                  <strong className="text-white capitalize">{dietaryFocus.replace('-', ' ')}</strong>
                  <span>•</span>
                  <span>Daily Goal:</span>
                  <strong className="text-white">{calorieTarget} kcal</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md gap-1.5 px-4 h-10 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Biometrics & Nutrition Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Biometric Indicators & Calculator */}
        <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Biometrics & Metabolism
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Body composition & daily expenditure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Live BMI & TDEE Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 ${bmiData.bg}`}>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">BMI Index</div>
                <div className={`text-xl font-black ${bmiData.color}`}>{bmiData.bmi}</div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{bmiData.label}</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Estimated TDEE</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {energyCalculations.tdee} <span className="text-xs font-normal">kcal</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  BMR: {energyCalculations.bmr} kcal
                </div>
              </div>
            </div>

            <Button
              onClick={applyTdeeTarget}
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Apply TDEE to Daily Calorie Goal
            </Button>

            {/* Inputs: Age, Gender, Height, Weight */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="bio-age" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Age (Years)
                </Label>
                <Input
                  id="bio-age"
                  type="number"
                  min="12"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 30)}
                  className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio-gender" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Biological Gender
                </Label>
                <select
                  id="bio-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-9 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio-height" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Height (cm)
                </Label>
                <Input
                  id="bio-height"
                  type="number"
                  min="100"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value) || 175)}
                  className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio-weight" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Weight (kg)
                </Label>
                <Input
                  id="bio-weight"
                  type="number"
                  min="30"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value) || 70)}
                  className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label htmlFor="bio-activity" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Activity Level
              </Label>
              <select
                id="bio-activity"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full h-9 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-white"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Lightly Active (1-3 days/week exercise)</option>
                <option value="moderate">Moderately Active (3-5 days/week exercise)</option>
                <option value="very_active">Very Active (6-7 days/week intense exercise)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Macro & Calorie Targets */}
        <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Daily Nutrition Targets
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Caloric budget and macronutrient split
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Display Name / Profile Handle
              </Label>
              <Input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Health Explorer"
                className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Daily Calorie Target */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="profile-calories" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Target Calories (kcal/day)
                </Label>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {calorieTarget} kcal
                </span>
              </div>
              <Input
                id="profile-calories"
                type="number"
                min="800"
                max="6000"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value) || 2000)}
                className="h-9 text-xs rounded-xl border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Macros: Protein, Carbs, Fat, Fiber */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="macro-protein" className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  Protein (g)
                </Label>
                <Input
                  id="macro-protein"
                  type="number"
                  min="20"
                  max="400"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(Number(e.target.value) || 75)}
                  className="h-9 text-xs rounded-xl border-blue-200 dark:border-blue-900/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="macro-carbs" className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Wheat className="w-3 h-3" />
                  Carbs (g)
                </Label>
                <Input
                  id="macro-carbs"
                  type="number"
                  min="20"
                  max="600"
                  value={carbsTarget}
                  onChange={(e) => setCarbsTarget(Number(e.target.value) || 250)}
                  className="h-9 text-xs rounded-xl border-amber-200 dark:border-amber-900/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="macro-fat" className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Total Fat (g)
                </Label>
                <Input
                  id="macro-fat"
                  type="number"
                  min="15"
                  max="250"
                  value={fatTarget}
                  onChange={(e) => setFatTarget(Number(e.target.value) || 65)}
                  className="h-9 text-xs rounded-xl border-rose-200 dark:border-rose-900/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="macro-fiber" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Fiber (g)
                </Label>
                <Input
                  id="macro-fiber"
                  type="number"
                  min="10"
                  max="100"
                  value={fiberTarget}
                  onChange={(e) => setFiberTarget(Number(e.target.value) || 30)}
                  className="h-9 text-xs rounded-xl border-emerald-200 dark:border-emerald-900/60"
                />
              </div>
            </div>

            {/* Macro Breakdown Bar */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex justify-between">
                <span>Calculated Calories:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {proteinTarget * 4 + carbsTarget * 4 + fatTarget * 9} kcal
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex w-full bg-slate-100 dark:bg-slate-800">
                <div 
                  style={{ width: `${Math.min(100, Math.round(((proteinTarget * 4) / Math.max(1, calorieTarget)) * 100))}%` }} 
                  className="bg-blue-500" 
                  title="Protein Calories"
                />
                <div 
                  style={{ width: `${Math.min(100, Math.round(((carbsTarget * 4) / Math.max(1, calorieTarget)) * 100))}%` }} 
                  className="bg-amber-500" 
                  title="Carb Calories"
                />
                <div 
                  style={{ width: `${Math.min(100, Math.round(((fatTarget * 9) / Math.max(1, calorieTarget)) * 100))}%` }} 
                  className="bg-rose-500" 
                  title="Fat Calories"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span className="text-blue-500">Protein ({Math.round(((proteinTarget * 4) / Math.max(1, calorieTarget)) * 100)}%)</span>
                <span className="text-amber-500">Carbs ({Math.round(((carbsTarget * 4) / Math.max(1, calorieTarget)) * 100)}%)</span>
                <span className="text-rose-500">Fat ({Math.round(((fatTarget * 9) / Math.max(1, calorieTarget)) * 100)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Dietary Focus & Allergens */}
        <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Dietary Focus & Allergies
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select your clinical nutritional guidelines
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Dietary Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dietary Focus Preset
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {DIETARY_OPTIONS.map((opt) => {
                  const isSelected = dietaryFocus === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => applyDietaryPreset(opt)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Allergens & Sensitivities */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Allergens & Dietary Exclusions
              </Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALLERGEN_OPTIONS.map((item) => {
                  const hasIt = selectedAllergens.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergen(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        hasIt 
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 font-bold' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {hasIt ? `✕ ${item}` : `+ ${item}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm h-10 gap-1.5 mt-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save All Preferences'}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
