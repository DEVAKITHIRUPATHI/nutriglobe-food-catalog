import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, Flame, Dumbbell, Wheat, Droplets, Trophy, Check, Sparkles, 
  ArrowLeftRight, Search, Zap, Heart, ShieldCheck, ChevronDown, RefreshCw
} from 'lucide-react';
import { FoodItemClient } from '@shared/schema';
import { foodItems } from '@shared/mockData';
import { getAccurateFoodImage, handleFoodImageError } from '@/lib/foodImageResolver';
import { LazyImage } from '@/components/ui/LazyImage';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

interface FoodComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItemA?: FoodItemClient | null;
  initialItemB?: FoodItemClient | null;
}

export const FoodComparisonModal: React.FC<FoodComparisonModalProps> = ({
  isOpen,
  onClose,
  initialItemA,
  initialItemB
}) => {
  const { t } = useTranslation();
  const allFoods = foodItems;

  const [foodA, setFoodA] = useState<FoodItemClient>(
    initialItemA || allFoods[0] || foodItems[0]
  );
  const [foodB, setFoodB] = useState<FoodItemClient>(
    initialItemB || allFoods[1] || foodItems[1]
  );

  const [portionA, setPortionA] = useState<number>(100); // grams
  const [portionB, setPortionB] = useState<number>(100); // grams

  const [searchA, setSearchA] = useState<string>('');
  const [searchB, setSearchB] = useState<string>('');
  const [dropdownAOpen, setDropdownAOpen] = useState(false);
  const [dropdownBOpen, setDropdownBOpen] = useState(false);

  // Sync initial items when modal opens
  React.useEffect(() => {
    if (initialItemA) setFoodA(initialItemA);
    if (initialItemB) setFoodB(initialItemB);
    else if (initialItemA && initialItemA.id === foodB.id) {
      const alt = allFoods.find(f => f.id !== initialItemA.id);
      if (alt) setFoodB(alt);
    }
  }, [initialItemA, initialItemB, isOpen]);

  // Portion multiplier ratio based on 100g standard
  const scaleA = portionA / 100;
  const scaleB = portionB / 100;

  // Scaled nutritional values
  const nutA = useMemo(() => ({
    calories: Math.round(foodA.nutrition.calories * scaleA),
    protein: Math.round(foodA.nutrition.protein * scaleA * 10) / 10,
    carbs: Math.round(foodA.nutrition.carbs * scaleA * 10) / 10,
    fat: Math.round(foodA.nutrition.fat * scaleA * 10) / 10,
    fiber: Math.round(foodA.nutrition.fiber * scaleA * 10) / 10,
    sugar: Math.round(((foodA.nutrition as any).sugar || 0) * scaleA * 10) / 10,
    water: Math.round(((foodA.nutrition as any).waterContent || 80) * scaleA),
    calcium: Math.round((foodA.nutrition.minerals?.['Calcium'] ? parseFloat(foodA.nutrition.minerals['Calcium']) : 20) * scaleA),
    iron: Math.round((foodA.nutrition.minerals?.['Iron'] ? parseFloat(foodA.nutrition.minerals['Iron']) : 1.5) * scaleA * 10) / 10,
    potassium: Math.round((foodA.nutrition.minerals?.['Potassium'] ? parseFloat(foodA.nutrition.minerals['Potassium']) : 250) * scaleA),
  }), [foodA, scaleA]);

  const nutB = useMemo(() => ({
    calories: Math.round(foodB.nutrition.calories * scaleB),
    protein: Math.round(foodB.nutrition.protein * scaleB * 10) / 10,
    carbs: Math.round(foodB.nutrition.carbs * scaleB * 10) / 10,
    fat: Math.round(foodB.nutrition.fat * scaleB * 10) / 10,
    fiber: Math.round(foodB.nutrition.fiber * scaleB * 10) / 10,
    sugar: Math.round(((foodB.nutrition as any).sugar || 0) * scaleB * 10) / 10,
    water: Math.round(((foodB.nutrition as any).waterContent || 80) * scaleB),
    calcium: Math.round((foodB.nutrition.minerals?.['Calcium'] ? parseFloat(foodB.nutrition.minerals['Calcium']) : 20) * scaleB),
    iron: Math.round((foodB.nutrition.minerals?.['Iron'] ? parseFloat(foodB.nutrition.minerals['Iron']) : 1.5) * scaleB * 10) / 10,
    potassium: Math.round((foodB.nutrition.minerals?.['Potassium'] ? parseFloat(foodB.nutrition.minerals['Potassium']) : 250) * scaleB),
  }), [foodB, scaleB]);

  // Chart data for Bar Chart side-by-side
  const chartData = [
    { name: 'Calories (kcal)', [t(foodA.name)]: nutA.calories, [t(foodB.name)]: nutB.calories },
    { name: 'Protein (g)', [t(foodA.name)]: nutA.protein, [t(foodB.name)]: nutB.protein },
    { name: 'Carbs (g)', [t(foodA.name)]: nutA.carbs, [t(foodB.name)]: nutB.carbs },
    { name: 'Fat (g)', [t(foodA.name)]: nutA.fat, [t(foodB.name)]: nutB.fat },
    { name: 'Fiber (g)', [t(foodA.name)]: nutA.fiber, [t(foodB.name)]: nutA.fiber },
  ];

  // Filtered lists for dropdown search
  const filteredA = useMemo(() => {
    if (!searchA.trim()) return allFoods.slice(0, 10);
    const q = searchA.toLowerCase();
    return allFoods.filter(f => t(f.name).toLowerCase().includes(q) || f.category.some(c => c.toLowerCase().includes(q))).slice(0, 10);
  }, [searchA, allFoods, t]);

  const filteredB = useMemo(() => {
    if (!searchB.trim()) return allFoods.slice(0, 10);
    const q = searchB.toLowerCase();
    return allFoods.filter(f => t(f.name).toLowerCase().includes(q) || f.category.some(c => c.toLowerCase().includes(q))).slice(0, 10);
  }, [searchB, allFoods, t]);

  const handleSwap = () => {
    const tempFood = foodA;
    const tempPortion = portionA;
    setFoodA(foodB);
    setPortionA(portionB);
    setFoodB(tempFood);
    setPortionB(tempPortion);
  };

  const nameA = t(foodA.name);
  const nameB = t(foodB.name);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white rounded-3xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
              <span>Side-by-Side Food Nutrition Comparison</span>
            </DialogTitle>
            <Button
              onClick={handleSwap}
              variant="outline"
              size="sm"
              className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl text-xs gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Swap Foods</span>
            </Button>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Compare macronutrients, calories, micronutrients, and nutritional advantages between any two foods in real time.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Top Selectors Bar: Item A vs Item B */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
            {/* Selector Food A */}
            <div className="md:col-span-5 relative">
              <label className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                Food A (Primary)
              </label>
              <button
                onClick={() => { setDropdownAOpen(!dropdownAOpen); setDropdownBOpen(false); }}
                className="w-full bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img 
                    src={getAccurateFoodImage(foodA)} 
                    alt={nameA} 
                    className="w-7 h-7 rounded-lg object-cover shrink-0" 
                    onError={(e) => handleFoodImageError(e, foodA.category)}
                  />
                  <span className="text-xs font-bold text-white truncate">{nameA}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              {/* Dropdown search modal A */}
              <AnimatePresence>
                {dropdownAOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 max-h-60 overflow-y-auto"
                  >
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search food A..."
                        value={searchA}
                        onChange={(e) => setSearchA(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredA.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { setFoodA(item); setDropdownAOpen(false); setSearchA(''); }}
                          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${item.id === foodA.id ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-200'}`}
                        >
                          <span className="truncate">{t(item.name)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.nutrition.calories} kcal</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VS Badge */}
            <div className="md:col-span-2 flex justify-center py-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-lg border-2 border-slate-950">
                VS
              </div>
            </div>

            {/* Selector Food B */}
            <div className="md:col-span-5 relative">
              <label className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1">
                Food B (Comparison)
              </label>
              <button
                onClick={() => { setDropdownBOpen(!dropdownBOpen); setDropdownAOpen(false); }}
                className="w-full bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 p-2.5 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img 
                    src={getAccurateFoodImage(foodB)} 
                    alt={nameB} 
                    className="w-7 h-7 rounded-lg object-cover shrink-0" 
                    onError={(e) => handleFoodImageError(e, foodB.category)}
                  />
                  <span className="text-xs font-bold text-white truncate">{nameB}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
              </button>

              {/* Dropdown search modal B */}
              <AnimatePresence>
                {dropdownBOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 max-h-60 overflow-y-auto"
                  >
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search food B..."
                        value={searchB}
                        onChange={(e) => setSearchB(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredB.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { setFoodB(item); setDropdownBOpen(false); setSearchB(''); }}
                          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${item.id === foodB.id ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'hover:bg-slate-800 text-slate-200'}`}
                        >
                          <span className="truncate">{t(item.name)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.nutrition.calories} kcal</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side-by-Side Hero Cards with Portion Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Food A */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <LazyImage 
                  src={getAccurateFoodImage(foodA)} 
                  alt={nameA} 
                  containerClassName="w-16 h-16 rounded-2xl border border-emerald-500/30 shadow-md shrink-0" 
                  onError={(e) => handleFoodImageError(e, foodA.category)}
                />
                <div className="flex-1 min-w-0">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] mb-1">
                    {foodA.category[0] || 'Food Item'}
                  </Badge>
                  <h3 className="text-base font-extrabold text-white truncate">{nameA}</h3>
                  <p className="text-xs text-slate-400">{foodA.origin}</p>
                </div>
              </div>

              {/* Portion Control */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Serving Weight:</span>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 150, 200].map((g) => (
                    <button
                      key={g}
                      onClick={() => setPortionA(g)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${portionA === g ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Stats summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Calories</span>
                  <strong className="text-emerald-400 text-sm font-black">{nutA.calories}</strong>
                  <span className="text-[9px] text-slate-500 block">kcal</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Protein</span>
                  <strong className="text-rose-400 text-sm font-black">{nutA.protein}g</strong>
                  <span className="text-[9px] text-slate-500 block">{Math.round(nutA.protein * 4)} kcal</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Carbs</span>
                  <strong className="text-amber-400 text-sm font-black">{nutA.carbs}g</strong>
                  <span className="text-[9px] text-slate-500 block">{Math.round(nutA.carbs * 4)} kcal</span>
                </div>
              </div>
            </div>

            {/* Card Food B */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <LazyImage 
                  src={getAccurateFoodImage(foodB)} 
                  alt={nameB} 
                  containerClassName="w-16 h-16 rounded-2xl border border-indigo-500/30 shadow-md shrink-0" 
                  onError={(e) => handleFoodImageError(e, foodB.category)}
                />
                <div className="flex-1 min-w-0">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] mb-1">
                    {foodB.category[0] || 'Food Item'}
                  </Badge>
                  <h3 className="text-base font-extrabold text-white truncate">{nameB}</h3>
                  <p className="text-xs text-slate-400">{foodB.origin}</p>
                </div>
              </div>

              {/* Portion Control */}
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Serving Weight:</span>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 150, 200].map((g) => (
                    <button
                      key={g}
                      onClick={() => setPortionB(g)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${portionB === g ? 'bg-indigo-500 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Stats summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Calories</span>
                  <strong className="text-indigo-400 text-sm font-black">{nutB.calories}</strong>
                  <span className="text-[9px] text-slate-500 block">kcal</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Protein</span>
                  <strong className="text-rose-400 text-sm font-black">{nutB.protein}g</strong>
                  <span className="text-[9px] text-slate-500 block">{Math.round(nutB.protein * 4)} kcal</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Carbs</span>
                  <strong className="text-amber-400 text-sm font-black">{nutB.carbs}g</strong>
                  <span className="text-[9px] text-slate-500 block">{Math.round(nutB.carbs * 4)} kcal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Macronutrient Chart & Comparative Progress Bars */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Macronutrient Side-by-Side Breakdown
              </h4>
              <span className="text-[11px] text-slate-400">Based on adjusted portions</span>
            </div>

            {/* Visual Recharts Bar Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey={nameA} fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey={nameB} fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Nutrient Difference Row Meters */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              {/* Protein Comparison Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300">Protein Content</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    <strong className="text-emerald-400">{nameA}: {nutA.protein}g</strong> vs <strong className="text-indigo-400">{nameB}: {nutB.protein}g</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex p-0.5 gap-1 border border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutA.protein / Math.max(1, nutA.protein + nutB.protein)) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-l-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutB.protein / Math.max(1, nutA.protein + nutB.protein)) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-r-full"
                  />
                </div>
              </div>

              {/* Fiber Comparison Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">Dietary Fiber</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    <strong className="text-emerald-400">{nameA}: {nutA.fiber}g</strong> vs <strong className="text-indigo-400">{nameB}: {nutB.fiber}g</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex p-0.5 gap-1 border border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutA.fiber / Math.max(0.1, nutA.fiber + nutB.fiber)) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-l-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutB.fiber / Math.max(0.1, nutA.fiber + nutB.fiber)) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-r-full"
                  />
                </div>
              </div>

              {/* Water Content Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300">Hydration (Water %)</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    <strong className="text-emerald-400">{nameA}: {nutA.water}%</strong> vs <strong className="text-indigo-400">{nameB}: {nutB.water}%</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex p-0.5 gap-1 border border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutA.water / Math.max(1, nutA.water + nutB.water)) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-l-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(nutB.water / Math.max(1, nutA.water + nutB.water)) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-r-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Advantage Verdict Section */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Nutritional Advantage Summary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Advantage Item A */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 space-y-1.5">
                <span className="font-extrabold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  {nameA} Strengths
                </span>
                <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                  {nutA.protein > nutB.protein && (
                    <li>Higher Protein ({nutA.protein}g vs {nutB.protein}g) — better for muscle synthesis</li>
                  )}
                  {nutA.calories < nutB.calories && (
                    <li>Lower Caloric Density ({nutA.calories} kcal vs {nutB.calories} kcal) — great for weight loss</li>
                  )}
                  {nutA.fiber > nutB.fiber && (
                    <li>Higher Dietary Fiber ({nutA.fiber}g vs {nutB.fiber}g) — supports digestive health</li>
                  )}
                  {nutA.water > nutB.water && (
                    <li>Higher Hydration Index ({nutA.water}% water)</li>
                  )}
                  {nutA.protein <= nutB.protein && nutA.calories >= nutB.calories && nutA.fiber <= nutB.fiber && (
                    <li>Provides balanced energy and essential trace minerals</li>
                  )}
                </ul>
              </div>

              {/* Advantage Item B */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/20 space-y-1.5">
                <span className="font-extrabold text-indigo-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  {nameB} Strengths
                </span>
                <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                  {nutB.protein > nutA.protein && (
                    <li>Higher Protein ({nutB.protein}g vs {nutA.protein}g) — better for muscle synthesis</li>
                  )}
                  {nutB.calories < nutA.calories && (
                    <li>Lower Caloric Density ({nutB.calories} kcal vs {nutA.calories} kcal) — great for weight loss</li>
                  )}
                  {nutB.fiber > nutA.fiber && (
                    <li>Higher Dietary Fiber ({nutB.fiber}g vs {nutA.fiber}g) — supports digestive health</li>
                  )}
                  {nutB.water > nutA.water && (
                    <li>Higher Hydration Index ({nutB.water}% water)</li>
                  )}
                  {nutB.protein <= nutA.protein && nutB.calories >= nutA.calories && nutB.fiber <= nutA.fiber && (
                    <li>Rich in bio-available energy and micronutrient profile</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
          <Button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl px-5 py-2"
          >
            Close Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
