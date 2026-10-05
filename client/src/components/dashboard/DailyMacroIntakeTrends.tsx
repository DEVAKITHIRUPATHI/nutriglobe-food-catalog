import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Activity,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  PlusCircle,
  Calendar,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Edit2,
  Clock,
  Layers,
  BarChart3,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Printer,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  ShieldCheck,
  Scale,
  Search,
  Check,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/contexts/AppContext';
import { 
  getDailyNutritionLogs, 
  getDailyNutritionLogByDate,
  logMealEntry, 
  deleteMealEntry, 
  updateMealEntry,
  seedSample7DayNutritionLogs, 
  clearDailyNutritionLogs,
  DailyNutritionLog, 
  LoggedMealEntry,
  UserNutritionProfile,
  getISODateString,
  getDayOfWeekShort,
  validateAtwaterCalories,
  calculateDailyNutritionScore,
  calculateAMDRStatus,
  generate7DayInsights,
  compare7DayPeriods,
  generatePrintable7DayReport
} from '@/lib/idb';
import type { FoodItemClient } from '@shared/schema';

interface DailyMacroIntakeTrendsProps {
  profile: UserNutritionProfile;
  favoriteFoods?: FoodItemClient[];
  onOpenProfileModal?: () => void;
}

// Consistent clinical theme colors for macronutrients
const MACRO_COLORS = {
  protein: '#3b82f6', // Sapphire Blue
  carbs: '#f59e0b',   // Warm Amber / Gold
  fat: '#ef4444',     // Coral Rose
  fiber: '#10b981',   // Emerald Green
  calories: '#8b5cf6',// Amethyst Purple
  target: '#64748b'   // Slate Gray
};

export function DailyMacroIntakeTrends({
  profile,
  favoriteFoods = [],
  onOpenProfileModal
}: DailyMacroIntakeTrendsProps) {
  const { foods: catalogFoods = [], language } = useContext(AppContext);
  const { toast } = useToast();
  const [logs, setLogs] = useState<DailyNutritionLog[]>([]);
  const [previousLogs, setPreviousLogs] = useState<DailyNutritionLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartViewMode, setChartViewMode] = useState<'trends' | 'calories' | 'stacked' | 'ratio'>('trends');
  const [activeMacroFilter, setActiveMacroFilter] = useState<'all' | 'protein' | 'carbs' | 'fat' | 'fiber'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getISODateString(0));
  const [showTargetLines, setShowTargetLines] = useState<boolean>(true);
  
  // Logging Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [logDate, setLogDate] = useState<string>(getISODateString(0));
  const [foodSourceMode, setFoodSourceMode] = useState<'catalog' | 'favorite' | 'custom'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [selectedCatalogFoodId, setSelectedCatalogFoodId] = useState<string>('');
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string>('');
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('25');
  const [customCarbs, setCustomCarbs] = useState<string>('45');
  const [customFat, setCustomFat] = useState<string>('12');
  const [customFiber, setCustomFiber] = useState<string>('6');
  const [servings, setServings] = useState<string>('1');
  const [servingGrams, setServingGrams] = useState<string>('100');
  const [customCalories, setCustomCalories] = useState<string>('388');

  // Printable Report Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load current 7 days and previous 7 days of logs
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const current = await getDailyNutritionLogs(7, 0);
      setLogs(current);

      // Fetch previous 7-day window (days -13 to -7)
      const prev = await getDailyNutritionLogs(7, -7);
      setPreviousLogs(prev);

      if (current.length > 0 && !selectedDate) {
        setSelectedDate(current[current.length - 1].date);
      }
    } catch (err) {
      console.error('Failed to load daily logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Today's log record (Day 0)
  const todayDateStr = getISODateString(0);
  const todayLog = useMemo(() => {
    return logs.find(l => l.date === todayDateStr) || {
      date: todayDateStr,
      dayLabel: 'Today',
      entries: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      updatedAt: Date.now()
    };
  }, [logs, todayDateStr]);

  // Today's Clinical Nutrition Score
  const todayScore = useMemo(() => {
    return calculateDailyNutritionScore(todayLog, profile);
  }, [todayLog, profile]);

  // Today's AMDR Status
  const todayAMDR = useMemo(() => {
    return calculateAMDRStatus(todayLog);
  }, [todayLog]);

  // 7-Day vs Previous 7-Day Comparison
  const periodComparison = useMemo(() => {
    return compare7DayPeriods(logs, previousLogs);
  }, [logs, previousLogs]);

  // 7-Day Automated Clinical Insights
  const clinicalInsights = useMemo(() => {
    return generate7DayInsights(logs, profile);
  }, [logs, profile]);

  // Format data specifically for Recharts
  const chartData = useMemo(() => {
    return logs.map(day => {
      const shortDay = getDayOfWeekShort(day.date);
      const proteinKcal = Math.round(day.totalProtein * 4);
      const carbsKcal = Math.round(day.totalCarbs * 4);
      const fatKcal = Math.round(day.totalFat * 9);
      const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

      // Energy distribution percentages (AMDR comparison)
      const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
      const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
      const fatPct = Math.round((fatKcal / totalMacroKcal) * 100);

      // Score for this specific day
      const dayScore = calculateDailyNutritionScore(day, profile);

      return {
        date: day.date,
        dayLabel: day.dayLabel,
        shortDay,
        protein: day.totalProtein,
        carbs: day.totalCarbs,
        fat: day.totalFat,
        fiber: day.totalFiber,
        calories: day.totalCalories,
        proteinKcal,
        carbsKcal,
        fatKcal,
        proteinPct,
        carbsPct,
        fatPct,
        score: dayScore.score,
        // User Targets
        proteinTarget: profile.proteinTarget,
        carbsTarget: profile.carbsTarget,
        fatTarget: profile.fatTarget,
        fiberTarget: profile.fiberTarget,
        calorieTarget: profile.calorieTarget
      };
    });
  }, [logs, profile]);

  // Selected Day Details
  const selectedDayLog = useMemo(() => {
    return logs.find(l => l.date === selectedDate) || logs[logs.length - 1] || null;
  }, [logs, selectedDate]);

  // Selected Day Score & AMDR
  const selectedDayScore = useMemo(() => {
    if (!selectedDayLog) return null;
    return calculateDailyNutritionScore(selectedDayLog, profile);
  }, [selectedDayLog, profile]);

  const selectedDayAMDR = useMemo(() => {
    if (!selectedDayLog) return null;
    return calculateAMDRStatus(selectedDayLog);
  }, [selectedDayLog]);

  // 7-Day Aggregate Statistics
  const stats = useMemo(() => {
    if (logs.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        avgFiber: 0,
        calorieAdherence: 0,
        proteinAdherence: 0,
        carbsAdherence: 0,
        fatAdherence: 0,
        consistencyScore: 0,
        loggedDaysCount: 0
      };
    }

    const count = logs.length;
    const activeDays = logs.filter(l => l.totalCalories > 0);
    const loggedCount = activeDays.length;

    const totalCal = logs.reduce((acc, l) => acc + l.totalCalories, 0);
    const totalP = logs.reduce((acc, l) => acc + l.totalProtein, 0);
    const totalC = logs.reduce((acc, l) => acc + l.totalCarbs, 0);
    const totalF = logs.reduce((acc, l) => acc + l.totalFat, 0);
    const totalFib = logs.reduce((acc, l) => acc + l.totalFiber, 0);

    const avgCalories = Math.round(totalCal / count);
    const avgProtein = Math.round((totalP / count) * 10) / 10;
    const avgCarbs = Math.round((totalC / count) * 10) / 10;
    const avgFat = Math.round((totalF / count) * 10) / 10;
    const avgFiber = Math.round((totalFib / count) * 10) / 10;

    const calorieAdherence = profile.calorieTarget > 0 
      ? Math.min(Math.round((avgCalories / profile.calorieTarget) * 100), 200) 
      : 100;
    const proteinAdherence = profile.proteinTarget > 0 
      ? Math.min(Math.round((avgProtein / profile.proteinTarget) * 100), 200) 
      : 100;
    const carbsAdherence = profile.carbsTarget > 0 
      ? Math.min(Math.round((avgCarbs / profile.carbsTarget) * 100), 200) 
      : 100;
    const fatAdherence = profile.fatTarget > 0 
      ? Math.min(Math.round((avgFat / profile.fatTarget) * 100), 200) 
      : 100;

    let adherenceHits = 0;
    activeDays.forEach(day => {
      const pRatio = profile.proteinTarget > 0 ? day.totalProtein / profile.proteinTarget : 1;
      const cRatio = profile.calorieTarget > 0 ? day.totalCalories / profile.calorieTarget : 1;
      if (pRatio >= 0.8 && pRatio <= 1.25) adherenceHits++;
      if (cRatio >= 0.8 && cRatio <= 1.25) adherenceHits++;
    });
    const maxPossibleHits = Math.max(activeDays.length * 2, 1);
    const consistencyScore = Math.round((adherenceHits / maxPossibleHits) * 100);

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      avgFiber,
      calorieAdherence,
      proteinAdherence,
      carbsAdherence,
      fatAdherence,
      consistencyScore: Math.min(Math.max(consistencyScore, 65), 98),
      loggedDaysCount: loggedCount
    };
  }, [logs, profile]);

  // Unique categories for the catalog picker
  const foodCategories = useMemo(() => {
    const set = new Set<string>();
    catalogFoods.forEach(f => {
      if (Array.isArray(f.category)) {
        f.category.forEach(c => set.add(c));
      }
    });
    return Array.from(set).sort();
  }, [catalogFoods]);

  // Filtered foods for catalog search
  const filteredCatalogFoods = useMemo(() => {
    let list = catalogFoods;
    if (catalogCategory !== 'all') {
      list = list.filter(f => Array.isArray(f.category) && f.category.some(c => c.toLowerCase() === catalogCategory.toLowerCase()));
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(f => {
        const en = f.name?.en?.toLowerCase() || '';
        const hi = f.name?.hi?.toLowerCase() || '';
        const sci = (f as any).scientificProfile?.scientificName?.toLowerCase() || (f as any).scientificName?.toLowerCase() || '';
        const cat = Array.isArray(f.category) ? f.category.join(' ').toLowerCase() : '';
        return en.includes(q) || hi.includes(q) || sci.includes(q) || cat.includes(q);
      });
    }
    return list.slice(0, 30);
  }, [catalogFoods, catalogCategory, catalogSearch]);

  // Handle selecting a food from the catalog
  const handleSelectCatalogFood = (foodId: string, gramsInput = servingGrams) => {
    setSelectedCatalogFoodId(foodId);
    const match = catalogFoods.find(f => f.id === foodId);
    if (match) {
      const displayName = (language === 'hi' && match.name.hi) ? match.name.hi : (match.name.en || match.name.hi || 'Food');
      setCustomFoodName(displayName);
      const nut = match.nutrition || {};
      const baseP = Number(nut.protein) || 0;
      const baseC = Number(nut.carbs) || 0;
      const baseF = Number(nut.fat) || 0;
      const baseFib = Number(nut.fiber) || 0;
      const baseCal = Number(nut.calories) || Math.round(baseP * 4 + baseC * 4 + baseF * 9);

      const g = Math.max(parseFloat(gramsInput) || 100, 10);
      const mult = Math.round((g / 100) * 100) / 100;
      setServings(String(mult));
      const pScaled = Math.round(baseP * mult * 10) / 10;
      const cScaled = Math.round(baseC * mult * 10) / 10;
      const fScaled = Math.round(baseF * mult * 10) / 10;
      const fibScaled = Math.round(baseFib * mult * 10) / 10;
      const calScaled = Math.round(baseCal * mult);

      setCustomProtein(String(pScaled));
      setCustomCarbs(String(cScaled));
      setCustomFat(String(fScaled));
      setCustomFiber(String(fibScaled));
      setCustomCalories(String(calScaled));
    }
  };

  // Handle portion grams update
  const handleServingGramsChange = (newGrams: string) => {
    setServingGrams(newGrams);
    const g = parseFloat(newGrams) || 0;
    if (g > 0 && selectedCatalogFoodId) {
      const match = catalogFoods.find(f => f.id === selectedCatalogFoodId);
      if (match) {
        const nut = match.nutrition || {};
        const mult = g / 100;
        setServings(String(Math.round(mult * 100) / 100));
        const baseP = Number(nut.protein) || 0;
        const baseC = Number(nut.carbs) || 0;
        const baseF = Number(nut.fat) || 0;
        const baseFib = Number(nut.fiber) || 0;
        const baseCal = Number(nut.calories) || Math.round(baseP * 4 + baseC * 4 + baseF * 9);
        setCustomProtein(String(Math.round(baseP * mult * 10) / 10));
        setCustomCarbs(String(Math.round(baseC * mult * 10) / 10));
        setCustomFat(String(Math.round(baseF * mult * 10) / 10));
        setCustomFiber(String(Math.round(baseFib * mult * 10) / 10));
        setCustomCalories(String(Math.round(baseCal * mult)));
        return;
      }
    }
    const mult = Math.max(parseFloat(newGrams) / 100 || 1, 0.1);
    setServings(String(Math.round(mult * 100) / 100));
  };

  // Handle opening modal for creating or editing meal
  const handleOpenAddModal = (dateStr?: string) => {
    setEditingMealId(null);
    setLogDate(dateStr || selectedDate || getISODateString(0));
    setMealType('lunch');
    setFoodSourceMode(catalogFoods.length > 0 ? 'catalog' : 'custom');
    setCatalogSearch('');
    setCatalogCategory('all');
    setSelectedCatalogFoodId('');
    setSelectedFavoriteId('');
    setCustomFoodName('');
    setCustomProtein('25');
    setCustomCarbs('45');
    setCustomFat('12');
    setCustomFiber('6');
    setServings('1');
    setServingGrams('100');
    setCustomCalories('388');
    setIsLogModalOpen(true);
  };

  const handleOpenEditModal = (dateStr: string, entry: LoggedMealEntry) => {
    setEditingMealId(entry.id);
    setLogDate(dateStr);
    setMealType(entry.mealType);
    setFoodSourceMode('custom');
    setSelectedCatalogFoodId(entry.foodId || '');
    setCustomFoodName(entry.foodName);
    setCustomProtein(String(entry.protein));
    setCustomCarbs(String(entry.carbs));
    setCustomFat(String(entry.fat));
    setCustomFiber(String(entry.fiber));
    setServings(String(entry.servings || 1));
    setServingGrams(String(entry.servingGrams || Math.round((entry.servings || 1) * 100)));
    setCustomCalories(String(entry.calories));
    setIsLogModalOpen(true);
  };

  // Real-time Atwater verification in modal
  const modalAtwaterValidation = useMemo(() => {
    const p = parseFloat(customProtein) || 0;
    const c = parseFloat(customCarbs) || 0;
    const f = parseFloat(customFat) || 0;
    const stated = parseFloat(customCalories) || 0;
    return validateAtwaterCalories(stated, p, c, f);
  }, [customProtein, customCarbs, customFat, customCalories]);

  // Handle saving meal (create or update)
  const handleSaveMeal = async () => {
    try {
      let foodName = customFoodName.trim();
      let p = parseFloat(customProtein) || 0;
      let c = parseFloat(customCarbs) || 0;
      let f = parseFloat(customFat) || 0;
      let fib = parseFloat(customFiber) || 0;
      let foodId = selectedCatalogFoodId || 'custom_food';
      let grams = parseFloat(servingGrams) || 100;
      let servingMultiplier = Math.max(parseFloat(servings) || (grams / 100), 0.1);

      if (foodSourceMode === 'favorite' && selectedFavoriteId && !editingMealId) {
        const match = favoriteFoods.find(fav => fav.id === selectedFavoriteId);
        if (match) {
          foodName = match.name.en || match.name.hi || 'Favorite Food';
          foodId = match.id;
        }
      }

      if (foodSourceMode === 'catalog' && selectedCatalogFoodId && !editingMealId) {
        const match = catalogFoods.find(cf => cf.id === selectedCatalogFoodId);
        if (match) {
          foodName = match.name.en || match.name.hi || foodName;
          foodId = match.id;
        }
      }

      if (!foodName) {
        toast({
          title: 'Food Name Required',
          description: 'Please specify the food or meal name to log.',
          variant: 'destructive'
        });
        return;
      }

      // Energy calculation with Atwater validation
      let statedCal = parseFloat(customCalories);
      const expectedAtwaterCal = Math.round(p * 4 + c * 4 + f * 9);
      if (isNaN(statedCal) || statedCal <= 0) {
        statedCal = expectedAtwaterCal;
      }

      const scaledP = Math.round(p * 10) / 10;
      const scaledC = Math.round(c * 10) / 10;
      const scaledF = Math.round(f * 10) / 10;
      const scaledFib = Math.round(fib * 10) / 10;

      if (editingMealId) {
        await updateMealEntry(logDate, editingMealId, {
          foodName,
          mealType,
          servings: servingMultiplier,
          servingGrams: Math.round(grams),
          calories: Math.round(statedCal),
          protein: scaledP,
          carbs: scaledC,
          fat: scaledF,
          fiber: scaledFib
        });
      } else {
        await logMealEntry(logDate, {
          foodId,
          foodName,
          mealType,
          servings: servingMultiplier,
          servingGrams: Math.round(grams),
          calories: Math.round(statedCal),
          protein: scaledP,
          carbs: scaledC,
          fat: scaledF,
          fiber: scaledFib
        });
      }

      await fetchLogs();
      setSelectedDate(logDate);
      setIsLogModalOpen(false);

      toast({
        title: editingMealId ? 'Meal Updated' : 'Nutrition Logged Successfully',
        description: `${editingMealId ? 'Updated' : 'Added'} "${foodName}" (${Math.round(statedCal)} kcal) for ${logDate}.`
      });
    } catch (err) {
      console.error('Failed to log meal:', err);
      toast({
        title: 'Error Logging Meal',
        description: 'Could not record intake in local storage.',
        variant: 'destructive'
      });
    }
  };

  // Handle removing a meal entry
  const handleDeleteMeal = async (dateStr: string, entryId: string) => {
    try {
      await deleteMealEntry(dateStr, entryId);
      await fetchLogs();
      toast({
        title: 'Meal Removed',
        description: 'Entry removed from daily nutrition log.'
      });
    } catch (err) {
      console.error('Failed to delete meal entry:', err);
    }
  };

  // Reset or Seed Demo Data
  const handleSeedDemoData = async () => {
    try {
      setIsLoading(true);
      await seedSample7DayNutritionLogs(profile);
      await fetchLogs();
      toast({
        title: '7-Day Diary Seeded',
        description: 'Loaded balanced clinical 7-day diary calibrated to your profile goals.'
      });
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all logs
  const handleClearLogs = async () => {
    try {
      setIsLoading(true);
      await clearDailyNutritionLogs();
      await fetchLogs();
      toast({
        title: 'Logs Cleared',
        description: '7-day daily intake history has been reset.'
      });
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export 7-day trend as CSV
  const handleExportCSV = () => {
    try {
      let csv = 'Date,Day,Calories (kcal),Protein (g),Carbohydrates (g),Fat (g),Fiber (g),Meal Count,Nutrition Score,Score Status\n';
      logs.forEach(l => {
        const sc = calculateDailyNutritionScore(l, profile);
        csv += `${l.date},"${l.dayLabel}",${l.totalCalories},${l.totalProtein},${l.totalCarbs},${l.totalFat},${l.totalFiber},${l.entries.length},${sc.score},"${sc.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nutrifacts_7day_macro_trends_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'CSV Exported',
        description: '7-day macronutrient intake log downloaded.'
      });
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    try {
      const data = {
        profile,
        current7Days: logs,
        previous7Days: previousLogs,
        comparison: periodComparison,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nutrifacts_nutrition_history_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: 'JSON Exported',
        description: 'Detailed nutrition history backup downloaded.'
      });
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[230px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white text-sm">{dataPoint.dayLabel}</span>
            <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-[10px] px-1.5 py-0 font-bold">
              {dataPoint.calories} kcal
            </Badge>
          </div>

          {dataPoint.calories === 0 ? (
            <div className="py-2.5 text-center text-slate-400 text-xs italic space-y-1">
              <div className="text-amber-400 font-semibold not-italic">No meals logged for this date (0 kcal)</div>
              <div className="text-[10px] text-slate-300">Click this day in the calendar below to log intake</div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Protein
                </span>
                <span className="font-mono font-bold text-white">
                  {dataPoint.protein}g <span className="text-[10px] text-slate-400">({dataPoint.proteinKcal} kcal)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Carbohydrates
                </span>
                <span className="font-mono font-bold text-white">
                  {dataPoint.carbs}g <span className="text-[10px] text-slate-400">({dataPoint.carbsKcal} kcal)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Healthy Fat
                </span>
                <span className="font-mono font-bold text-white">
                  {dataPoint.fat}g <span className="text-[10px] text-slate-400">({dataPoint.fatKcal} kcal)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Dietary Fiber
                </span>
                <span className="font-mono font-bold text-white">
                  {dataPoint.fiber}g
                </span>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between items-center">
            <span>Daily Nutrition Score:</span>
            <span className="text-emerald-400 font-bold font-mono text-xs">{dataPoint.score} / 100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Bar with Global Actions */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Daily Macronutrient Intake Trends &amp; QA Dashboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evidence-calibrated tracking of Protein, Carbs, Fat, Fiber, AMDR adherence, and 7-day rolling performance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenAddModal(todayDateStr)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm h-8"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Today&apos;s Meal</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPrintModalOpen(true)}
            className="text-xs gap-1.5 h-8 border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print Report</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 h-8 border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>CSV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            className="text-xs gap-1.5 h-8 border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>JSON</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSeedDemoData}
            title="Seed realistic 7-day diary calibrated to your profile"
            className="text-xs gap-1.5 h-8 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reset Demo</span>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Today's Progress Section & Nutrition Score Banner */}
      {/* ------------------------------------------------------------- */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50/70 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {todayScore.score}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Today&apos;s Nutrition Progress ({todayLog.dayLabel})
                  </h3>
                  <Badge className={`${todayScore.badgeColor} text-white font-bold text-xs uppercase px-2 py-0.5`}>
                    {todayScore.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily Nutrition Score: <strong className="text-slate-900 dark:text-white font-mono">{todayScore.score}/100</strong> • Weighted by Calorie equilibrium (25%), Protein (20%), Carbs (15%), Lipids (15%), Fiber (15%), and AMDR balance (10%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1 py-1 px-2.5 bg-white dark:bg-slate-800">
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                <span>AMDR: {todayAMDR.isOverallWithinRange ? 'Within Range' : 'Adjusting'}</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenAddModal(todayDateStr)}
                className="text-xs font-bold gap-1 h-8"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Log</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Today's Nutrient Progress Bars Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Calories Progress */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-purple-500" />
                  Calories
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((todayLog.totalCalories / (profile.calorieTarget || 2000)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                  {todayLog.totalCalories}
                </span>
                <span className="text-slate-400 text-[11px]">/ {profile.calorieTarget} kcal</span>
              </div>
              <Progress 
                value={Math.min((todayLog.totalCalories / (profile.calorieTarget || 2000)) * 100, 100)} 
                className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-purple-600"
              />
            </div>

            {/* Protein Progress */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-500" />
                  Protein
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((todayLog.totalProtein / (profile.proteinTarget || 75)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                  {todayLog.totalProtein}g
                </span>
                <span className="text-slate-400 text-[11px]">/ {profile.proteinTarget}g</span>
              </div>
              <Progress 
                value={Math.min((todayLog.totalProtein / (profile.proteinTarget || 75)) * 100, 100)} 
                className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-blue-600"
              />
            </div>

            {/* Carbohydrates Progress */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-amber-500" />
                  Carbohydrates
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  {Math.round((todayLog.totalCarbs / (profile.carbsTarget || 250)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                  {todayLog.totalCarbs}g
                </span>
                <span className="text-slate-400 text-[11px]">/ {profile.carbsTarget}g</span>
              </div>
              <Progress 
                value={Math.min((todayLog.totalCarbs / (profile.carbsTarget || 250)) * 100, 100)} 
                className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-amber-600"
              />
            </div>

            {/* Fat Progress */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-rose-500" />
                  Healthy Fat
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                  {Math.round((todayLog.totalFat / (profile.fatTarget || 65)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                  {todayLog.totalFat}g
                </span>
                <span className="text-slate-400 text-[11px]">/ {profile.fatTarget}g</span>
              </div>
              <Progress 
                value={Math.min((todayLog.totalFat / (profile.fatTarget || 65)) * 100, 100)} 
                className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-rose-600"
              />
            </div>

            {/* Fiber Progress */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Dietary Fiber
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((todayLog.totalFiber / (profile.fiberTarget || 30)) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                  {todayLog.totalFiber}g
                </span>
                <span className="text-slate-400 text-[11px]">/ {profile.fiberTarget}g target</span>
              </div>
              <Progress 
                value={Math.min((todayLog.totalFiber / (profile.fiberTarget || 30)) * 100, 100)} 
                className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-emerald-600"
              />
            </div>
          </div>

          {/* Today's AMDR Comparison Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                Today&apos;s Energy Distribution vs WHO AMDR Standards:
              </span>
              <span className="text-slate-500 text-[11px]">
                AMDR Status: <strong className={todayAMDR.isOverallWithinRange ? 'text-emerald-600' : 'text-amber-600'}>{todayAMDR.summary}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                todayAMDR.isProteinWithinRange ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <span className="text-blue-700 dark:text-blue-300 font-semibold">Protein: {todayAMDR.proteinPct}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Benchmark: 10–35%</span>
              </div>

              <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                todayAMDR.isCarbsWithinRange ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <span className="text-amber-700 dark:text-amber-300 font-semibold">Carbs: {todayAMDR.carbsPct}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Benchmark: 45–65%</span>
              </div>

              <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                todayAMDR.isFatWithinRange ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <span className="text-rose-700 dark:text-rose-300 font-semibold">Fat: {todayAMDR.fatPct}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Benchmark: 20–35%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 3. 7-Day vs Previous-7-Day Comparison Strip */}
      {/* ------------------------------------------------------------- */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                7-Day vs Previous 7-Day Period Trends
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {periodComparison.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-mono">
            {/* Calories Delta */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-sans">Calories:</span>
              <span className={`font-bold flex items-center ${periodComparison.caloriesDeltaPct >= 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {periodComparison.caloriesDeltaPct > 0 ? '+' : ''}{periodComparison.caloriesDeltaPct}%
              </span>
            </div>

            {/* Protein Delta */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-sans">Protein:</span>
              <span className={`font-bold flex items-center ${periodComparison.proteinDeltaPct >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {periodComparison.proteinDeltaPct > 0 ? '+' : ''}{periodComparison.proteinDeltaPct}%
              </span>
            </div>

            {/* Carbs Delta */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-sans">Carbs:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {periodComparison.carbsDeltaPct > 0 ? '+' : ''}{periodComparison.carbsDeltaPct}%
              </span>
            </div>

            {/* Fat Delta */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-sans">Fat:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {periodComparison.fatDeltaPct > 0 ? '+' : ''}{periodComparison.fatDeltaPct}%
              </span>
            </div>

            {/* Fiber Delta */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-sans">Fiber:</span>
              <span className={`font-bold flex items-center ${periodComparison.fiberDeltaPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {periodComparison.fiberDeltaPct > 0 ? '+' : ''}{periodComparison.fiberDeltaPct}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 4. Intelligent Clinical Nutrition Insights Panel */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {clinicalInsights.map(insight => (
          <Card key={insight.id} className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                insight.type === 'positive' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                insight.type === 'improvement' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
              }`}>
                {insight.type === 'positive' ? <CheckCircle2 className="w-4 h-4" /> :
                 insight.type === 'improvement' ? <AlertCircle className="w-4 h-4" /> :
                 <Info className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {insight.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Main Recharts Visualization Card */}
      {/* ------------------------------------------------------------- */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Macronutrient Daily Trends (Last 7 Days)</span>
                <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono">
                  {logs.length} Days Recorded
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive Recharts curves. Click any day on the chart to inspect itemized meals and Atwater verification.
              </CardDescription>
            </div>

            {/* View Modes & Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={chartViewMode} onValueChange={(v: any) => setChartViewMode(v)} className="h-8">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-0.5 h-8 rounded-lg">
                  <TabsTrigger value="trends" className="text-[11px] font-bold px-2.5 h-7">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Macro Curves
                  </TabsTrigger>
                  <TabsTrigger value="stacked" className="text-[11px] font-bold px-2.5 h-7">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Stacked Calories
                  </TabsTrigger>
                  <TabsTrigger value="ratio" className="text-[11px] font-bold px-2.5 h-7">
                    <Percent className="w-3 h-3 mr-1" />
                    Macro %
                  </TabsTrigger>
                  <TabsTrigger value="calories" className="text-[11px] font-bold px-2.5 h-7">
                    <Flame className="w-3 h-3 mr-1" />
                    Energy Target
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant={showTargetLines ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTargetLines(prev => !prev)}
                className="h-8 text-xs px-2.5 gap-1"
                title="Toggle Target Goal Reference Lines"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Target Goals</span>
              </Button>
            </div>
          </div>

          {/* Macro Quick Filter Buttons (only on trends view) */}
          {chartViewMode === 'trends' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Highlight:</span>
              <button
                onClick={() => setActiveMacroFilter('all')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeMacroFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All 4 Macros
              </button>
              <button
                onClick={() => setActiveMacroFilter('protein')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeMacroFilter === 'protein'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Protein ({stats.avgProtein}g avg)
              </button>
              <button
                onClick={() => setActiveMacroFilter('carbs')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeMacroFilter === 'carbs'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Carbohydrates ({stats.avgCarbs}g avg)
              </button>
              <button
                onClick={() => setActiveMacroFilter('fat')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeMacroFilter === 'fat'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fat ({stats.avgFat}g avg)
              </button>
              <button
                onClick={() => setActiveMacroFilter('fiber')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeMacroFilter === 'fiber'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Fiber ({stats.avgFiber}g avg)
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 pt-4">
          <div className="h-[340px] sm:h-[380px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                <RotateCcw className="w-5 h-5 animate-spin mr-2" />
                Loading daily nutrition charts...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === 'trends' ? (
                  <AreaChart
                    data={chartData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload.length) {
                        setSelectedDate(data.activePayload[0].payload.date);
                      }
                    }}
                    margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MACRO_COLORS.protein} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={MACRO_COLORS.protein} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MACRO_COLORS.carbs} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={MACRO_COLORS.carbs} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MACRO_COLORS.fat} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={MACRO_COLORS.fat} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFiber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MACRO_COLORS.fiber} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={MACRO_COLORS.fiber} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="shortDay" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                    />
                    <YAxis 
                      unit="g"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                    />

                    {showTargetLines && (activeMacroFilter === 'all' || activeMacroFilter === 'protein') && (
                      <ReferenceLine 
                        y={profile.proteinTarget} 
                        stroke={MACRO_COLORS.protein} 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5}
                        label={{ value: `Goal: ${profile.proteinTarget}g P`, position: 'insideTopRight', fill: MACRO_COLORS.protein, fontSize: 10 }}
                      />
                    )}
                    {showTargetLines && (activeMacroFilter === 'carbs') && (
                      <ReferenceLine 
                        y={profile.carbsTarget} 
                        stroke={MACRO_COLORS.carbs} 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5}
                        label={{ value: `Goal: ${profile.carbsTarget}g C`, position: 'insideTopRight', fill: MACRO_COLORS.carbs, fontSize: 10 }}
                      />
                    )}

                    {(activeMacroFilter === 'all' || activeMacroFilter === 'carbs') && (
                      <Area
                        type="monotone"
                        dataKey="carbs"
                        name="Carbohydrates (g)"
                        stroke={MACRO_COLORS.carbs}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorCarbs)"
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    )}

                    {(activeMacroFilter === 'all' || activeMacroFilter === 'protein') && (
                      <Area
                        type="monotone"
                        dataKey="protein"
                        name="Protein (g)"
                        stroke={MACRO_COLORS.protein}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorProtein)"
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    )}

                    {(activeMacroFilter === 'all' || activeMacroFilter === 'fat') && (
                      <Area
                        type="monotone"
                        dataKey="fat"
                        name="Fat (g)"
                        stroke={MACRO_COLORS.fat}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorFat)"
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    )}

                    {(activeMacroFilter === 'all' || activeMacroFilter === 'fiber') && (
                      <Area
                        type="monotone"
                        dataKey="fiber"
                        name="Dietary Fiber (g)"
                        stroke={MACRO_COLORS.fiber}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorFiber)"
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    )}
                  </AreaChart>
                ) : chartViewMode === 'stacked' ? (
                  <BarChart
                    data={chartData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload.length) {
                        setSelectedDate(data.activePayload[0].payload.date);
                      }
                    }}
                    margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="shortDay" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                    />
                    <YAxis 
                      unit=" kcal"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                    />

                    {showTargetLines && (
                      <ReferenceLine 
                        y={profile.calorieTarget} 
                        stroke="#8b5cf6" 
                        strokeDasharray="4 4" 
                        strokeWidth={2}
                        label={{ value: `Calorie Goal: ${profile.calorieTarget} kcal`, position: 'insideTopRight', fill: '#8b5cf6', fontSize: 10, fontWeight: 700 }}
                      />
                    )}

                    <Bar dataKey="proteinKcal" name="Protein Calories (4 kcal/g)" stackId="a" fill={MACRO_COLORS.protein} />
                    <Bar dataKey="carbsKcal" name="Carbs Calories (4 kcal/g)" stackId="a" fill={MACRO_COLORS.carbs} />
                    <Bar dataKey="fatKcal" name="Fat Calories (9 kcal/g)" stackId="a" fill={MACRO_COLORS.fat} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartViewMode === 'ratio' ? (
                  <BarChart
                    data={chartData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload.length) {
                        setSelectedDate(data.activePayload[0].payload.date);
                      }
                    }}
                    margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="shortDay" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                    />
                    <YAxis 
                      unit="%" 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                    />

                    <Bar dataKey="proteinPct" name="% Energy from Protein (AMDR: 10–35%)" stackId="pct" fill={MACRO_COLORS.protein} />
                    <Bar dataKey="carbsPct" name="% Energy from Carbs (AMDR: 45–65%)" stackId="pct" fill={MACRO_COLORS.carbs} />
                    <Bar dataKey="fatPct" name="% Energy from Fat (AMDR: 20–35%)" stackId="pct" fill={MACRO_COLORS.fat} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <ComposedChart
                    data={chartData}
                    onClick={(data) => {
                      if (data && data.activePayload && data.activePayload.length) {
                        setSelectedDate(data.activePayload[0].payload.date);
                      }
                    }}
                    margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="shortDay" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                    />
                    <YAxis 
                      unit=" kcal"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                    />

                    <ReferenceLine 
                      y={profile.calorieTarget} 
                      stroke="#8b5cf6" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      label={{ value: `Target Goal: ${profile.calorieTarget} kcal`, position: 'insideTopRight', fill: '#8b5cf6', fontSize: 11, fontWeight: 700 }}
                    />

                    <Bar dataKey="calories" name="Total Daily Calories" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="calorieTarget" 
                      name="Goal Reference" 
                      stroke="#475569" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Atwater Clinical Factor Integrity:</strong> Calories calculated via <code>(Protein × 4) + (Carbs × 4) + (Fat × 9)</code> with biochemical assay rounding tolerance.
              </span>
            </div>
            {onOpenProfileModal && (
              <button 
                onClick={onOpenProfileModal}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0"
              >
                Configure Biometrics &amp; Targets →
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 6. Selected Day Inspector & Itemized Food Log */}
      {/* ------------------------------------------------------------- */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Day Intake Breakdown: {selectedDayLog ? selectedDayLog.dayLabel : selectedDate}
                </CardTitle>
                {selectedDayScore && (
                  <Badge className={`${selectedDayScore.badgeColor} text-white font-bold text-[10px] uppercase`}>
                    Score: {selectedDayScore.score}/100 • {selectedDayScore.status}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Itemized meals and foods logged for this 24-hour cycle. Click edit or delete on any meal.
              </CardDescription>
            </div>

            {/* Day Selector Buttons with Missing Day Handling */}
            <div className="flex flex-wrap items-center gap-1.5">
              {logs.map(l => {
                const isSelected = selectedDate === l.date;
                const isEmpty = l.totalCalories === 0;
                return (
                  <button
                    key={l.date}
                    onClick={() => setSelectedDate(l.date)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40'
                        : isEmpty
                        ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>{getDayOfWeekShort(l.date)}</span>
                    <span className="text-[9px] font-mono font-medium">
                      {isEmpty ? '0 kcal' : `${l.totalCalories} kcal`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-1 space-y-4">
          {selectedDayLog && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Calories</div>
                <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                  {selectedDayLog.totalCalories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Protein</div>
                <div className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                  {selectedDayLog.totalProtein}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Carbohydrates</div>
                <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                  {selectedDayLog.totalCarbs}g
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Healthy Fat</div>
                <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                  {selectedDayLog.totalFat}g
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 font-semibold">Dietary Fiber</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedDayLog.totalFiber}g
                </div>
              </div>
            </div>
          )}

          {/* Atwater Daily Consistency Audit */}
          {selectedDayLog && selectedDayLog.totalCalories > 0 && (() => {
            const atwaterDay = validateAtwaterCalories(
              selectedDayLog.totalCalories,
              selectedDayLog.totalProtein,
              selectedDayLog.totalCarbs,
              selectedDayLog.totalFat
            );
            return (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Atwater Validation: <span className="font-mono text-purple-600 dark:text-purple-400">{selectedDayLog.totalCalories} kcal stated</span> ≈ <span className="font-mono text-emerald-600 dark:text-emerald-400">{atwaterDay.expectedKcal} kcal calculated</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] font-mono ${atwaterDay.isValid ? 'text-emerald-700 border-emerald-300 bg-white dark:bg-slate-900' : 'text-amber-700 border-amber-300'}`}>
                    {atwaterDay.isValid ? 'Biochemically Validated' : `Assay Diff: ${atwaterDay.diff} kcal`}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    ((P×4) + (C×4) + (F×9))
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Itemized Meal List */}
          {selectedDayLog && selectedDayLog.entries && selectedDayLog.entries.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-hidden">
              {selectedDayLog.entries.map(entry => {
                const atwater = validateAtwaterCalories(entry.calories, entry.protein, entry.carbs, entry.fat);
                return (
                  <div key={entry.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] uppercase font-bold tracking-wider ${
                          entry.mealType === 'breakfast' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          entry.mealType === 'lunch' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          entry.mealType === 'dinner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {entry.mealType}
                        </Badge>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {entry.foodName}
                        </span>
                        {atwater.isValid && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-emerald-600 border-emerald-300 dark:border-emerald-800 font-mono">
                            Atwater Validated
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Portion: {entry.servingGrams}g ({entry.servings}x)</span>
                        <span>•</span>
                        <span className="text-purple-600 font-semibold">{entry.calories} kcal</span>
                        <span>•</span>
                        <span className="text-blue-600">P: {entry.protein}g</span>
                        <span>•</span>
                        <span className="text-amber-600">C: {entry.carbs}g</span>
                        <span>•</span>
                        <span className="text-rose-600">F: {entry.fat}g</span>
                        {entry.fiber > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600">Fib: {entry.fiber}g</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(selectedDayLog.date, entry)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                        title="Edit meal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMeal(selectedDayLog.date, entry.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Remove meal entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Meals Logged for {selectedDayLog ? selectedDayLog.dayLabel : selectedDate}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Log your breakfast, lunch, dinner, or snacks to track daily macronutrient trends against your target goals.
              </p>
              <Button
                size="sm"
                onClick={() => handleOpenAddModal(selectedDate)}
                className="mt-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Log a Meal for this Day
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* 7. Log / Edit Food Modal Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              {editingMealId ? 'Edit Meal Entry' : 'Log Daily Nutrition Intake'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record meals to update your 7-day macronutrient curves, AMDR adherence, and daily scores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Day / Date</Label>
                <Select value={logDate} onValueChange={setLogDate}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {logs.map(l => (
                      <SelectItem key={l.date} value={l.date} className="text-xs">
                        {l.dayLabel} {l.date === todayDateStr ? '(Today)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meal Session</Label>
                <Select value={mealType} onValueChange={(v: any) => setMealType(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Meal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast" className="text-xs">Breakfast</SelectItem>
                    <SelectItem value="lunch" className="text-xs">Lunch</SelectItem>
                    <SelectItem value="dinner" className="text-xs">Dinner</SelectItem>
                    <SelectItem value="snack" className="text-xs">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Food Source</Label>
                {!editingMealId && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setFoodSourceMode('catalog')}
                      className={`px-2 py-0.5 rounded font-bold text-[11px] transition-colors ${
                        foodSourceMode === 'catalog' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      NutriFacts Catalog ({catalogFoods.length})
                    </button>
                    {favoriteFoods.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFoodSourceMode('favorite')}
                        className={`px-2 py-0.5 rounded font-bold text-[11px] transition-colors ${
                          foodSourceMode === 'favorite' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Favorites ({favoriteFoods.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFoodSourceMode('custom')}
                      className={`px-2 py-0.5 rounded font-bold text-[11px] transition-colors ${
                        foodSourceMode === 'custom' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Custom Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Mode 1: NutriFacts Real Catalog Search */}
              {foodSourceMode === 'catalog' && !editingMealId && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <Input
                        placeholder="Search 1,379 foods (e.g. Lentils, Spinach, Oats, Apple, Salmon)..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="text-xs pl-8 h-8"
                      />
                    </div>
                    {foodCategories.length > 0 && (
                      <Select value={catalogCategory} onValueChange={setCatalogCategory}>
                        <SelectTrigger className="text-xs w-36 h-8">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="max-h-56">
                          <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                          {foodCategories.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-xs capitalize">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Matching food item picker */}
                  <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-900">
                    {filteredCatalogFoods.length > 0 ? (
                      filteredCatalogFoods.map(food => {
                        const isChosen = selectedCatalogFoodId === food.id;
                        const nut = food.nutrition || {};
                        const enName = food.name?.en || food.name?.hi || 'Food';
                        return (
                          <div
                            key={food.id}
                            onClick={() => handleSelectCatalogFood(food.id)}
                            className={`p-2 rounded-md cursor-pointer transition-colors text-xs flex items-center justify-between ${
                              isChosen
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                <span className="text-slate-900 dark:text-white font-bold">{enName}</span>
                                {(food as any).scientificName && (
                                  <span className="text-[10px] text-slate-400 italic truncate font-serif">
                                    ({(food as any).scientificName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="capitalize">{food.category || 'General'}</span>
                                <span>•</span>
                                <span>100g: <strong className="text-purple-600 font-semibold">{nut.calories || 0} kcal</strong></span>
                                <span>•</span>
                                <span>P: {nut.protein || 0}g</span>
                                <span>•</span>
                                <span>C: {nut.carbs || 0}g</span>
                                <span>•</span>
                                <span>F: {nut.fat || 0}g</span>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isChosen ? 'default' : 'outline'}
                              className={`h-6 text-[10px] px-2 shrink-0 ${isChosen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                            >
                              {isChosen ? <Check className="w-3 h-3 mr-1" /> : null}
                              {isChosen ? 'Selected' : 'Pick'}
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        No food items match &quot;{catalogSearch}&quot;.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Favorites picker */}
              {foodSourceMode === 'favorite' && favoriteFoods.length > 0 && !editingMealId && (
                <Select 
                  value={selectedFavoriteId} 
                  onValueChange={(val) => {
                    setSelectedFavoriteId(val);
                    const match = favoriteFoods.find(f => f.id === val);
                    if (match) {
                      setCustomFoodName(match.name.en || match.name.hi || 'Food');
                      const nut = match.nutrition || {};
                      const baseP = Number(nut.protein) || 0;
                      const baseC = Number(nut.carbs) || 0;
                      const baseF = Number(nut.fat) || 0;
                      const baseFib = Number(nut.fiber) || 0;
                      const baseCal = Number(nut.calories) || Math.round(baseP * 4 + baseC * 4 + baseF * 9);
                      const g = parseFloat(servingGrams) || 100;
                      const mult = g / 100;
                      setServings(String(mult));
                      setCustomProtein(String(Math.round(baseP * mult * 10) / 10));
                      setCustomCarbs(String(Math.round(baseC * mult * 10) / 10));
                      setCustomFat(String(Math.round(baseF * mult * 10) / 10));
                      setCustomFiber(String(Math.round(baseFib * mult * 10) / 10));
                      setCustomCalories(String(Math.round(baseCal * mult)));
                    }
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pick a saved favorite food..." />
                  </SelectTrigger>
                  <SelectContent>
                    {favoriteFoods.map(fav => (
                      <SelectItem key={fav.id} value={fav.id} className="text-xs">
                        {fav.name.en || fav.name.hi} ({fav.nutrition?.calories || 0} kcal, {fav.nutrition?.protein || 0}g P)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Food Name Display / Edit */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Meal / Item Name</Label>
                <Input
                  placeholder="e.g. Yellow Lentil Dal with Basmati Rice"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Serving & Grams Portion Controls */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Portion Quantity</Label>
                <span className="text-[11px] font-mono text-slate-500">
                  {servingGrams}g ({servings}x serving multiplier)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    min="10"
                    step="10"
                    max="2000"
                    value={servingGrams}
                    onChange={(e) => handleServingGramsChange(e.target.value)}
                    className="text-xs pr-8 h-8 font-mono font-bold"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">grams</span>
                </div>

                {/* Gram presets */}
                <div className="flex items-center gap-1">
                  {['50', '100', '150', '200'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleServingGramsChange(preset)}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${
                        servingGrams === preset
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {preset}g
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrient Amounts & Real-time Atwater Validation */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Scaled Nutrient Values ({servingGrams}g portion):
                </span>
                <Badge variant="outline" className={`text-[10px] font-mono ${modalAtwaterValidation.isValid ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' : 'text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40'}`}>
                  {modalAtwaterValidation.diff === 0 
                    ? 'Atwater Exact Match' 
                    : modalAtwaterValidation.isValid 
                    ? `Atwater Validated (±${modalAtwaterValidation.diff} kcal)` 
                    : `Discrepancy: ${modalAtwaterValidation.diff} kcal`}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <Label className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    Protein (g)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <span className="text-[9px] text-slate-400 font-mono">
                    = {Math.round((parseFloat(customProtein) || 0) * 4)} kcal
                  </span>
                </div>

                <div>
                  <Label className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    Carbs (g)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <span className="text-[9px] text-slate-400 font-mono">
                    = {Math.round((parseFloat(customCarbs) || 0) * 4)} kcal
                  </span>
                </div>

                <div>
                  <Label className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    Fat (g)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <span className="text-[9px] text-slate-400 font-mono">
                    = {Math.round((parseFloat(customFat) || 0) * 9)} kcal
                  </span>
                </div>

                <div>
                  <Label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Fiber (g)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customFiber}
                    onChange={(e) => setCustomFiber(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <span className="text-[9px] text-slate-400 font-mono">
                    prebiotic
                  </span>
                </div>
              </div>

              {/* Stated Energy vs Atwater Formula Breakdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Total Calories:</Label>
                  <div className="relative w-28">
                    <Input
                      type="number"
                      min="0"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      className="text-xs font-mono font-bold h-7 pr-8"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] text-slate-400">kcal</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] text-slate-500">
                    Atwater: <strong className="text-slate-800 dark:text-slate-200 font-mono">{modalAtwaterValidation.expectedKcal} kcal</strong>
                  </span>
                  {modalAtwaterValidation.diff > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCustomCalories(String(modalAtwaterValidation.expectedKcal))}
                      className="h-6 text-[10px] px-2 font-bold border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                    >
                      <RefreshCw className="w-2.5 h-2.5 mr-1" />
                      Sync with Atwater
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveMeal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              {editingMealId ? 'Save Changes' : 'Save to Daily Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 8. Printable 7-Day Clinical Nutrition Summary Report Modal */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[580px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Printer className="w-5 h-5 text-emerald-600" />
              7-Day Clinical Dietary Intake Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Printable summary of your 7-day macronutrient averages and AMDR compliance.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-[360px] whitespace-pre border border-slate-800">
            {generatePrintable7DayReport(logs, profile)}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintModalOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.print();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print via Browser</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { DailyMacroIntakeTrends as DailyMacroTrendsDashboard };
export default DailyMacroIntakeTrends;
