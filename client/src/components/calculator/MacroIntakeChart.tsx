import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Calendar, Flame, Dumbbell, Wheat, Droplets, 
  PlusCircle, RefreshCw, CheckCircle2, Sparkles, BarChart3, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DailyMacroLog {
  day: string;
  date: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  calories: number;
  targetCalories: number;
}

const DEFAULT_7_DAY_TRENDS: DailyMacroLog[] = [
  { day: 'Mon', date: 'Jul 25', proteinGrams: 110, carbGrams: 210, fatGrams: 55, calories: 1775, targetCalories: 1850 },
  { day: 'Tue', date: 'Jul 26', proteinGrams: 125, carbGrams: 195, fatGrams: 60, calories: 1820, targetCalories: 1850 },
  { day: 'Wed', date: 'Jul 27', proteinGrams: 118, carbGrams: 220, fatGrams: 58, calories: 1874, targetCalories: 1850 },
  { day: 'Thu', date: 'Jul 28', proteinGrams: 130, carbGrams: 180, fatGrams: 52, calories: 1708, targetCalories: 1850 },
  { day: 'Fri', date: 'Jul 29', proteinGrams: 105, carbGrams: 240, fatGrams: 65, calories: 1965, targetCalories: 1850 },
  { day: 'Sat', date: 'Jul 30', proteinGrams: 140, carbGrams: 190, fatGrams: 58, calories: 1842, targetCalories: 1850 },
  { day: 'Sun', date: 'Today',  proteinGrams: 128, carbGrams: 205, fatGrams: 54, calories: 1818, targetCalories: 1850 },
];

interface MacroIntakeChartProps {
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}

export function MacroIntakeChart({
  targetCalories = 1850,
  targetProtein = 125,
  targetCarbs = 200,
  targetFats = 55,
}: MacroIntakeChartProps) {
  const [logs, setLogs] = useState<DailyMacroLog[]>(DEFAULT_7_DAY_TRENDS);
  const [activeMetric, setActiveMetric] = useState<'all' | 'macros' | 'calories'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  
  // Quick Log form state
  const [showLogModal, setShowLogModal] = useState(false);
  const [newProtein, setNewProtein] = useState('125');
  const [newCarbs, setNewCarbs] = useState('200');
  const [newFats, setNewFats] = useState('55');

  // Calculated 7-day average metrics
  const averages = useMemo(() => {
    const totalDays = logs.length || 1;
    const avgProtein = Math.round(logs.reduce((acc, curr) => acc + curr.proteinGrams, 0) / totalDays);
    const avgCarbs = Math.round(logs.reduce((acc, curr) => acc + curr.carbGrams, 0) / totalDays);
    const avgFats = Math.round(logs.reduce((acc, curr) => acc + curr.fatGrams, 0) / totalDays);
    const avgCal = Math.round(logs.reduce((acc, curr) => acc + curr.calories, 0) / totalDays);
    const goalAdherence = Math.min(100, Math.round((avgCal / targetCalories) * 100));

    return {
      avgProtein,
      avgCarbs,
      avgFats,
      avgCal,
      goalAdherence,
    };
  }, [logs, targetCalories]);

  const handleLogToday = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(newProtein) || 0;
    const c = parseInt(newCarbs) || 0;
    const f = parseInt(newFats) || 0;
    const totalCal = (p * 4) + (c * 4) + (f * 9);

    const updated = [...logs];
    const todayIndex = updated.length - 1;
    updated[todayIndex] = {
      ...updated[todayIndex],
      proteinGrams: p,
      carbGrams: c,
      fatGrams: f,
      calories: totalCal,
      targetCalories: targetCalories,
    };

    setLogs(updated);
    setShowLogModal(false);
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>7-Day Clinical Macro Telemetry</span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              Macronutrient Intake Trends
            </CardTitle>
            <CardDescription className="text-emerald-100/80 text-xs mt-0.5">
              Track daily protein, carbs, fats, and caloric totals over the last 7 days compared against target goals.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowLogModal(!showLogModal)}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Log Today's Intake
            </Button>
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'area' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'bar' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bars
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Log Today Modal / Collapse */}
        <AnimatePresence>
          {showLogModal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Quick Log Today's Macronutrient Intake
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Target Calorie Goal: <strong>{targetCalories} kcal</strong>
                </span>
              </div>
              <form onSubmit={handleLogToday} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Protein (g)</Label>
                  <Input
                    type="number"
                    value={newProtein}
                    onChange={(e) => setNewProtein(e.target.value)}
                    className="rounded-xl border-emerald-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Carbs (g)</Label>
                  <Input
                    type="number"
                    value={newCarbs}
                    onChange={(e) => setNewCarbs(e.target.value)}
                    className="rounded-xl border-emerald-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Fats (g)</Label>
                  <Input
                    type="number"
                    value={newFats}
                    onChange={(e) => setNewFats(e.target.value)}
                    className="rounded-xl border-emerald-300 text-xs font-bold"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9">
                  Save Intake
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 7-Day Averages Metric Header Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              Avg Protein
            </span>
            <div className="text-xl font-black text-rose-950 dark:text-rose-100">
              {averages.avgProtein}g <span className="text-[10px] font-normal text-rose-600">/ {targetProtein}g</span>
            </div>
            <div className="w-full bg-rose-200 dark:bg-rose-900/50 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((averages.avgProtein / targetProtein) * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Wheat className="w-3 h-3" />
              Avg Carbs
            </span>
            <div className="text-xl font-black text-amber-950 dark:text-amber-100">
              {averages.avgCarbs}g <span className="text-[10px] font-normal text-amber-600">/ {targetCarbs}g</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-900/50 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-amber-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((averages.avgCarbs / targetCarbs) * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              Avg Fats
            </span>
            <div className="text-xl font-black text-sky-950 dark:text-sky-100">
              {averages.avgFats}g <span className="text-[10px] font-normal text-sky-600">/ {targetFats}g</span>
            </div>
            <div className="w-full bg-sky-200 dark:bg-sky-900/50 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-sky-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((averages.avgFats / targetFats) * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-3.5 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Avg Calories
            </span>
            <div className="text-xl font-black text-emerald-950 dark:text-emerald-100">
              {averages.avgCal} <span className="text-[10px] font-normal text-emerald-600">kcal</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold block">
              {averages.goalAdherence}% Goal Adherence
            </span>
          </div>
        </div>

        {/* View Filter Switcher */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500'
              }`}
            >
              All Macros & Calories
            </button>
            <button
              onClick={() => setActiveMetric('macros')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'macros' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500'
              }`}
            >
              Gram Macros Only
            </button>
            <button
              onClick={() => setActiveMetric('calories')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMetric === 'calories' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500'
              }`}
            >
              Caloric Trend vs Target
            </button>
          </div>
        </div>

        {/* Recharts Main Chart Container */}
        <div className="w-full h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={logs} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="carbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              
              {/* Y-Axis 1: Grams */}
              <YAxis yAxisId="grams" orientation="left" stroke="#64748b" fontSize={11} tickLine={false} unit="g" />
              
              {/* Y-Axis 2: Calories */}
              <YAxis yAxisId="calories" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} unit=" kcal" domain={[1000, 2500]} />

              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyMacroLog;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold">
                          <span className="text-emerald-400">{data.day} ({data.date})</span>
                          <span className="text-slate-400 text-[10px]">Daily Log</span>
                        </div>
                        <div className="space-y-1 font-medium">
                          <div className="flex justify-between items-center text-rose-400 gap-4">
                            <span>Protein:</span>
                            <strong>{data.proteinGrams}g</strong>
                          </div>
                          <div className="flex justify-between items-center text-amber-400 gap-4">
                            <span>Carbs:</span>
                            <strong>{data.carbGrams}g</strong>
                          </div>
                          <div className="flex justify-between items-center text-sky-400 gap-4">
                            <span>Fats:</span>
                            <strong>{data.fatGrams}g</strong>
                          </div>
                          <div className="flex justify-between items-center text-emerald-400 border-t border-slate-800 pt-1 font-bold gap-4">
                            <span>Intake Calories:</span>
                            <span>{data.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} 
                iconType="circle"
              />

              {/* Render Macros when requested */}
              {(activeMetric === 'all' || activeMetric === 'macros') && (
                <>
                  {chartType === 'area' ? (
                    <>
                      <Area yAxisId="grams" type="monotone" dataKey="proteinGrams" name="Protein (g)" stroke="#f43f5e" fill="url(#proteinGrad)" strokeWidth={2.5} />
                      <Area yAxisId="grams" type="monotone" dataKey="carbGrams" name="Carbs (g)" stroke="#f59e0b" fill="url(#carbGrad)" strokeWidth={2.5} />
                      <Area yAxisId="grams" type="monotone" dataKey="fatGrams" name="Fats (g)" stroke="#0284c7" fill="url(#fatGrad)" strokeWidth={2.5} />
                    </>
                  ) : (
                    <>
                      <Bar yAxisId="grams" dataKey="proteinGrams" name="Protein (g)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="grams" dataKey="carbGrams" name="Carbs (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="grams" dataKey="fatGrams" name="Fats (g)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                </>
              )}

              {/* Render Calories Line */}
              {(activeMetric === 'all' || activeMetric === 'calories') && (
                <>
                  <Line yAxisId="calories" type="monotone" dataKey="calories" name="Total Calories (kcal)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  <Line yAxisId="calories" type="dash" dataKey="targetCalories" name="Target Goal (kcal)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
