import React, { useContext, useMemo, useState } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { CartContext } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, TrendingUp, Dumbbell, Wheat, Droplets, HeartPulse, 
  PlusCircle, Trash2, CheckCircle2, Sparkles, Scale, Info
} from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/useTranslation';

export function HomeCaloricIntakeChart() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calories' | 'macros' | 'breakdown'>('calories');
  const [targetCalories, setTargetCalories] = useState<number>(2000);

  // Compute live totals from CartContext items
  const loggedTotals = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        const n = item.foodItem.nutrition;
        acc.calories += (n.calories || 0) * qty;
        acc.protein += (n.protein || 0) * qty;
        acc.carbs += (n.carbs || 0) * qty;
        acc.fat += (n.fat || 0) * qty;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [cartItems]);

  // Generate 7-day historical trend data incorporating today's live logged totals from CartContext
  const chartData = useMemo(() => {
    // Standard baseline for past 6 days
    const pastDays = [
      { day: 'Mon', calories: 1850, protein: 110, carbs: 220, fat: 55 },
      { day: 'Tue', calories: 1920, protein: 125, carbs: 210, fat: 60 },
      { day: 'Wed', calories: 1780, protein: 105, carbs: 195, fat: 50 },
      { day: 'Thu', calories: 2050, protein: 130, carbs: 230, fat: 65 },
      { day: 'Fri', calories: 1890, protein: 118, carbs: 205, fat: 58 },
      { day: 'Sat', calories: 1960, protein: 122, carbs: 215, fat: 62 },
    ];

    // Today's entry dynamically uses loggedTotals from CartContext if logged, else fallback demo baseline
    const todayCalories = loggedTotals.calories > 0 ? loggedTotals.calories : 1840;
    const todayProtein = loggedTotals.protein > 0 ? loggedTotals.protein : 115;
    const todayCarbs = loggedTotals.carbs > 0 ? loggedTotals.carbs : 200;
    const todayFat = loggedTotals.fat > 0 ? loggedTotals.fat : 54;

    const todayEntry = {
      day: 'Today (Live)',
      calories: Math.round(todayCalories),
      protein: Math.round(todayProtein),
      carbs: Math.round(todayCarbs),
      fat: Math.round(todayFat),
      target: targetCalories,
      isLive: true,
    };

    return [...pastDays.map(d => ({ ...d, target: targetCalories, isLive: false })), todayEntry];
  }, [loggedTotals, targetCalories]);

  const percentageOfGoal = Math.min(150, Math.round((loggedTotals.calories / targetCalories) * 100));

  return (
    <Card className="my-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden max-w-7xl mx-auto">
      {/* Header Banner */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Caloric Telemetry</span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              Daily Caloric Intake & Macro Tracker
            </CardTitle>
            <CardDescription className="text-emerald-100/80 text-xs md:text-sm">
              Live nutrition values synced from your saved items in CartContext.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 flex gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('calories')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeTab === 'calories'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Caloric Trend
              </button>
              <button
                onClick={() => setActiveTab('macros')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeTab === 'macros'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Macro Breakdown
              </button>
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeTab === 'breakdown'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Logged Items ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calories Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600" />
                Today's Calories
              </span>
              <Badge variant="outline" className="border-emerald-400 text-emerald-800 dark:text-emerald-300 text-[10px]">
                {cartItems.length > 0 ? 'Live Sync' : 'Base Goal'}
              </Badge>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {Math.round(loggedTotals.calories)}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ {targetCalories} kcal</span>
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentageOfGoal}%` }}
              />
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">
              {cartItems.length > 0 ? `${percentageOfGoal}% of 2,000 kcal target` : 'Add foods to cart/favorites to log'}
            </span>
          </div>

          {/* Protein Card */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-rose-600" />
                Protein
              </span>
              <span className="text-[10px] text-rose-600 font-bold">Target: 120g</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.round(loggedTotals.protein)}g
            </div>
            <div className="w-full bg-rose-200 dark:bg-rose-900/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((loggedTotals.protein / 120) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold block">
              {Math.round((loggedTotals.protein * 4))} kcal from Protein
            </span>
          </div>

          {/* Carbs Card */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-amber-600" />
                Carbohydrates
              </span>
              <span className="text-[10px] text-amber-600 font-bold">Target: 220g</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.round(loggedTotals.carbs)}g
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-900/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((loggedTotals.carbs / 220) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold block">
              {Math.round((loggedTotals.carbs * 4))} kcal from Carbs
            </span>
          </div>

          {/* Fats Card */}
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 text-xs font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                Healthy Fats
              </span>
              <span className="text-[10px] text-sky-600 font-bold">Target: 60g</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.round(loggedTotals.fat)}g
            </div>
            <div className="w-full bg-sky-200 dark:bg-sky-900/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((loggedTotals.fat / 60) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-sky-700 dark:text-sky-300 font-bold block">
              {Math.round((loggedTotals.fat * 9))} kcal from Fats
            </span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'breakdown' ? (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  CartContext Logged Foods ({cartItems.length} items)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Items you add or favorite automatically contribute to your daily intake totals.
                </p>
              </div>
              {cartItems.length > 0 && (
                <Button
                  onClick={clearCart}
                  variant="outline"
                  size="sm"
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cart
                </Button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Info className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No foods currently logged in your CartContext favorites list.
                </p>
                <p className="text-xs text-slate-400">
                  Click the heart or cart button on any food card below to log its calories and macros instantly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {t(item.foodItem.name)}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.foodItem.nutrition.calories} kcal
                        </span>
                        <span>•</span>
                        <span>P: {item.foodItem.nutrition.protein}g</span>
                        <span>C: {item.foodItem.nutrition.carbs}g</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Recharts Interactive Chart */
          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="homeCalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="cal" orientation="left" stroke="#10b981" fontSize={11} tickLine={false} unit=" kcal" domain={[1000, 2600]} />
                <YAxis yAxisId="mac" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} unit="g" />

                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 backdrop-blur-md">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1 font-bold">
                            <span className="text-emerald-400">{data.day}</span>
                            {data.isLive && (
                              <Badge className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1.5 py-0">
                                Live Cart Sync
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 font-medium">
                            <div className="flex justify-between items-center text-emerald-400 font-bold">
                              <span>Total Calories:</span>
                              <span>{data.calories} kcal</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-400 text-[11px]">
                              <span>Protein:</span>
                              <span>{data.protein}g</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-400 text-[11px]">
                              <span>Carbs:</span>
                              <span>{data.carbs}g</span>
                            </div>
                            <div className="flex justify-between items-center text-sky-400 text-[11px]">
                              <span>Fat:</span>
                              <span>{data.fat}g</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} iconType="circle" />

                {activeTab === 'calories' ? (
                  <>
                    <Area yAxisId="cal" type="monotone" dataKey="calories" name="Daily Caloric Intake (kcal)" stroke="#10b981" fill="url(#homeCalGrad)" strokeWidth={3} />
                    <Line yAxisId="cal" type="dash" dataKey="target" name="Target Goal (2,000 kcal)" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </>
                ) : (
                  <>
                    <Bar yAxisId="mac" dataKey="protein" name="Protein (g)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="mac" dataKey="carbs" name="Carbs (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="mac" dataKey="fat" name="Fats (g)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
