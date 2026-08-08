import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Droplet, GlassWater, Plus, RotateCcw, Flame, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_STORAGE_KEY = 'nutriglobe_hydration_tracker_v1';

interface HydrationData {
  date: string;
  intakeMl: number;
  goalMl: number;
  streakDays: number;
}

export function HydrationTracker() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [intakeMl, setIntakeMl] = useState<number>(1250);
  const [goalMl, setGoalMl] = useState<number>(2500);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [customAmount, setCustomAmount] = useState<string>('250');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Load persisted hydration state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: HydrationData = JSON.parse(saved);
        if (parsed.date === todayStr) {
          setIntakeMl(parsed.intakeMl || 0);
          setGoalMl(parsed.goalMl || 2500);
          setStreakDays(parsed.streakDays || 1);
        } else {
          // New day reset intake, calculate streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = parsed.date === yesterdayStr && parsed.intakeMl >= parsed.goalMl 
            ? (parsed.streakDays || 0) + 1 
            : 1;

          setIntakeMl(0);
          setGoalMl(parsed.goalMl || 2500);
          setStreakDays(newStreak);
        }
      }
    } catch (e) {
      console.error('Failed to load hydration data', e);
    }
  }, [todayStr]);

  // Save changes
  useEffect(() => {
    try {
      const dataToSave: HydrationData = {
        date: todayStr,
        intakeMl,
        goalMl,
        streakDays,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save hydration data', e);
    }
  }, [intakeMl, goalMl, streakDays, todayStr]);

  // Handle logging water
  const addWater = (amount: number) => {
    const newTotal = Math.max(0, intakeMl + amount);
    setIntakeMl(newTotal);

    if (newTotal >= goalMl && intakeMl < goalMl) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  const handleReset = () => {
    setIntakeMl(0);
  };

  const progressPct = Math.min(100, Math.round((intakeMl / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - intakeMl);
  const glassesLogged = (intakeMl / 250).toFixed(1);

  return (
    <Card className="my-8 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
      {/* Background ambient water glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="p-6 pb-2 border-b border-emerald-800/40 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30">
              <Droplet className="w-6 h-6 text-emerald-400 animate-bounce" fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl sm:text-2xl font-black text-white">
                  Daily Hydration Tracker
                </CardTitle>
                <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30 text-[10px] font-bold">
                  Active Sync
                </Badge>
              </div>
              <CardDescription className="text-xs text-emerald-200/80 mt-0.5">
                Log your daily water intake to maintain cellular health, kidney function, and energy balance
              </CardDescription>
            </div>
          </div>

          {/* Hydration Streak Counter */}
          <div className="flex items-center gap-2 bg-emerald-900/80 px-3.5 py-1.5 rounded-full border border-emerald-700/50 text-xs font-bold text-emerald-200">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streakDays} Day Hydration Streak!</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Progress Wave Ring & Main Stats */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 space-y-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer Circular Progress Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  className="stroke-emerald-900/60"
                  strokeWidth="12"
                  fill="transparent"
                />
                <motion.circle
                  cx="88"
                  cy="88"
                  r="76"
                  className="stroke-emerald-400"
                  strokeWidth="12"
                  strokeDasharray={477.5}
                  initial={{ strokeDashoffset: 477.5 }}
                  animate={{ strokeDashoffset: 477.5 - (477.5 * progressPct) / 100 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-0.5">
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Hydrated</span>
                <span className="text-3xl font-black text-white">{progressPct}%</span>
                <span className="text-xs text-emerald-200 font-medium">{intakeMl} / {goalMl} ml</span>
                <span className="text-[10px] text-emerald-400">({glassesLogged} glasses)</span>
              </div>
            </div>

            {/* Quick Status Subtitle */}
            <div className="text-center space-y-1">
              {intakeMl >= goalMl ? (
                <Badge className="bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1 gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Goal Reached Today!
                </Badge>
              ) : (
                <p className="text-xs text-emerald-200">
                  <strong className="text-emerald-300 font-bold">{remainingMl} ml</strong> remaining to hit your target
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Quick Hydration Action Buttons & Goal Adjustment */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-2">
                Quick Log Water Intake
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Button
                  onClick={() => addWater(250)}
                  className="bg-emerald-800/60 hover:bg-emerald-600 text-white border border-emerald-500/40 rounded-xl py-3 flex flex-col items-center gap-1 shadow-md transition-all hover:scale-105"
                >
                  <GlassWater className="w-4 h-4 text-emerald-200" />
                  <span className="text-xs font-bold">+250 ml</span>
                  <span className="text-[9px] text-emerald-200/80">Glass</span>
                </Button>

                <Button
                  onClick={() => addWater(500)}
                  className="bg-emerald-800/60 hover:bg-emerald-600 text-white border border-emerald-500/40 rounded-xl py-3 flex flex-col items-center gap-1 shadow-md transition-all hover:scale-105"
                >
                  <Droplet className="w-4 h-4 text-emerald-200" fill="currentColor" />
                  <span className="text-xs font-bold">+500 ml</span>
                  <span className="text-[9px] text-emerald-200/80">Bottle</span>
                </Button>

                <Button
                  onClick={() => addWater(750)}
                  className="bg-emerald-800/60 hover:bg-emerald-600 text-white border border-emerald-500/40 rounded-xl py-3 flex flex-col items-center gap-1 shadow-md transition-all hover:scale-105"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold">+750 ml</span>
                  <span className="text-[9px] text-emerald-200/80">Large Flask</span>
                </Button>

                <Button
                  onClick={() => addWater(100)}
                  className="bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/40 rounded-xl py-3 flex flex-col items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-bold">+100 ml</span>
                  <span className="text-[9px] text-emerald-300/80">Sip</span>
                </Button>
              </div>
            </div>

            {/* Custom Add & Set Goal Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Custom Add Amount */}
              <div className="flex gap-2 items-center bg-emerald-950/80 p-2 rounded-2xl border border-emerald-800/60">
                <Input
                  type="number"
                  min={10}
                  max={2000}
                  step={50}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-emerald-900/50 border-emerald-700 text-white text-xs font-bold rounded-xl h-9"
                  placeholder="Custom ml"
                />
                <Button
                  onClick={() => {
                    const amt = parseInt(customAmount, 10);
                    if (!isNaN(amt) && amt > 0) addWater(amt);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl h-9 px-3 gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Log
                </Button>
              </div>

              {/* Adjust Goal Target */}
              <div className="flex gap-2 items-center bg-emerald-950/80 p-2 rounded-2xl border border-emerald-800/60">
                <span className="text-[11px] font-bold text-emerald-300 whitespace-nowrap pl-1">Goal:</span>
                <Input
                  type="number"
                  min={1000}
                  max={5000}
                  step={250}
                  value={goalMl}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 500) setGoalMl(val);
                  }}
                  className="bg-emerald-900/50 border-emerald-700 text-white text-xs font-bold rounded-xl h-9"
                />
                <Button
                  onClick={handleReset}
                  variant="outline"
                  title="Reset today's water intake"
                  className="bg-emerald-900/40 hover:bg-rose-950/60 text-emerald-200 border-emerald-700 hover:border-rose-700 rounded-xl h-9 px-2 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Overlay Banner */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="p-3.5 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-between text-xs shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                <span>Congratulations! You reached your daily hydration goal of {goalMl} ml!</span>
              </div>
              <Badge className="bg-slate-950 text-emerald-400 text-[10px]">Hydrated!</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
