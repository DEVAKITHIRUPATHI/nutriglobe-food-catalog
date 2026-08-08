import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, BellRing, BellOff, Droplet, Apple, Clock, Sparkles, CheckCircle2, 
  AlertCircle, Volume2, VolumeX, Coffee, Dumbbell, Flame, HeartPulse, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NutritionNotificationManagerProps {
  userWeightKg?: number;
  userTdee?: number;
  userGoal?: string;
  waterTargetLiters?: number;
  proteinTargetGrams?: number;
}

interface HealthySnack {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'weight_loss' | 'muscle_gain' | 'energy_boost' | 'hydration';
  description: string;
  benefits: string;
}

const HEALTHY_SNACKS: HealthySnack[] = [
  {
    id: 'snack-1',
    name: 'Greek Yogurt with Blueberry & Chia',
    calories: 140,
    protein: 15,
    carbs: 12,
    fat: 3,
    category: 'weight_loss',
    description: 'Probiotic-rich plain Greek yogurt topped with fresh blueberries and chia seeds.',
    benefits: 'High protein for satiety, antioxidant blue pigments & gut health support.',
  },
  {
    id: 'snack-2',
    name: 'Almonds & Walnuts Trail Handful (30g)',
    calories: 180,
    protein: 6,
    carbs: 6,
    fat: 16,
    category: 'energy_boost',
    description: 'Raw unsalted almonds and walnuts rich in essential omega-3 fatty acids.',
    benefits: 'Sustained cognitive energy, brain-derived neurotrophic support & heart safety.',
  },
  {
    id: 'snack-3',
    name: 'Hard-Boiled Eggs with Black Pepper (2 pcs)',
    calories: 150,
    protein: 12,
    carbs: 1,
    fat: 10,
    category: 'muscle_gain',
    description: 'Two whole organic eggs sprinkled with freshly cracked black pepper and sea salt.',
    benefits: 'Complete amino acid profile with bioavailable choline for muscle repair.',
  },
  {
    id: 'snack-4',
    name: 'Hummus with Crunchy Cucumber & Carrot Sticks',
    calories: 110,
    protein: 4,
    carbs: 14,
    fat: 5,
    category: 'weight_loss',
    description: 'Creamy chickpea hummus paired with hydrating fresh cucumber slices.',
    benefits: 'High soluble dietary fiber, zero refined sugars, and steady glucose maintenance.',
  },
  {
    id: 'snack-5',
    name: 'Steamed Edamame Beans with Sea Salt (100g)',
    calories: 120,
    protein: 11,
    carbs: 9,
    fat: 4,
    category: 'muscle_gain',
    description: 'Warm young soybeans in pods seasoned lightly with Himalayan pink salt.',
    benefits: 'Plant-based complete protein packed with folate, magnesium, and potassium.',
  },
  {
    id: 'snack-6',
    name: 'Watermelon Slices & Mint Leaf (200g)',
    calories: 60,
    protein: 1,
    carbs: 15,
    fat: 0,
    category: 'hydration',
    description: 'Cold crisp watermelon wedges garnished with fresh crushed mint leaves.',
    benefits: 'Ultra-hydrating (92% water) with natural lycopene and L-citrulline for blood flow.',
  },
];

const LOCAL_STORAGE_KEY_SETTINGS = 'nutriglobe_notification_settings_v1';
const LOCAL_STORAGE_KEY_HYDRATION_LOG = 'nutriglobe_hydration_tracker_v1';

export function NutritionNotificationManager({
  userWeightKg = 65,
  userTdee = 2100,
  userGoal = 'maintain',
  waterTargetLiters = 2.5,
  proteinTargetGrams = 80,
}: NutritionNotificationManagerProps) {
  // Browser Notification Permission State
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // Settings States
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reminderIntervalMins, setReminderIntervalMins] = useState<number>(60);
  const [snackPreference, setSnackPreference] = useState<'all' | 'high_protein' | 'low_calorie' | 'hydration'>('all');

  // Activity Logged States
  const [todayWaterLoggedMl, setTodayWaterLoggedMl] = useState<number>(1250);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [activeAlert, setActiveAlert] = useState<{ title: string; body: string; type: 'hydration' | 'snack'; snack?: HealthySnack } | null>(null);

  // Check Notification API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved settings
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.notificationsEnabled === 'boolean') setNotificationsEnabled(parsed.notificationsEnabled);
        if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
        if (parsed.reminderIntervalMins) setReminderIntervalMins(parsed.reminderIntervalMins);
        if (parsed.snackPreference) setSnackPreference(parsed.snackPreference);
      }
    } catch (e) {
      console.warn('Failed to read notification settings:', e);
    }

    // Load today's hydration log
    try {
      const savedHydration = localStorage.getItem(LOCAL_STORAGE_KEY_HYDRATION_LOG);
      if (savedHydration) {
        const parsed = JSON.parse(savedHydration);
        if (parsed.intakeMl !== undefined) {
          setTodayWaterLoggedMl(parsed.intakeMl);
        }
      }
    } catch (e) {
      console.warn('Failed to read hydration log:', e);
    }
  }, []);

  // Save Settings
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify({
          notificationsEnabled,
          soundEnabled,
          reminderIntervalMins,
          snackPreference,
        })
      );
    } catch (e) {
      console.warn('Failed to save notification settings:', e);
    }
  }, [notificationsEnabled, soundEnabled, reminderIntervalMins, snackPreference]);

  // Request Web Notification Permissions
  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Web Notifications API is not supported in this browser environment.');
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        sendBrowserNotification(
          '🔔 NutriGlobe Notifications Active!',
          'You will now receive periodic hydration reminders & personalized healthy snack suggestions based on your calculator targets.'
        );
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  // Play audio chime if enabled
  const playChimeSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('AudioContext playback prevented or not supported:', e);
    }
  }, [soundEnabled]);

  // Core function to send real browser desktop notification
  const sendBrowserNotification = useCallback((title: string, body: string, iconUrl?: string) => {
    playChimeSound();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && notificationsEnabled) {
      try {
        new Notification(title, {
          body,
          icon: iconUrl || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'nutriglobe-nutrition-reminder',
        });
      } catch (err) {
        console.warn('Native notification creation error:', err);
      }
    }
  }, [notificationsEnabled, playChimeSound]);

  // Smart Recommendation Algorithm based on Logged Calculator Metrics
  const recommendedSnack = useMemo(() => {
    let filtered = HEALTHY_SNACKS;
    if (snackPreference === 'high_protein') {
      filtered = HEALTHY_SNACKS.filter(s => s.protein >= 10);
    } else if (snackPreference === 'low_calorie') {
      filtered = HEALTHY_SNACKS.filter(s => s.calories <= 120);
    } else if (snackPreference === 'hydration') {
      filtered = HEALTHY_SNACKS.filter(s => s.category === 'hydration');
    } else if (userGoal.includes('loss')) {
      filtered = HEALTHY_SNACKS.filter(s => s.category === 'weight_loss' || s.calories <= 130);
    } else if (userGoal.includes('gain') || userGoal === 'muscle') {
      filtered = HEALTHY_SNACKS.filter(s => s.category === 'muscle_gain' || s.protein >= 10);
    }

    if (filtered.length === 0) filtered = HEALTHY_SNACKS;
    // Pick random snack from filtered
    return filtered[Math.floor(Math.random() * filtered.length)];
  }, [snackPreference, userGoal]);

  // Trigger Hydration Break Notification
  const triggerHydrationAlert = useCallback(() => {
    const targetMl = Math.round(waterTargetLiters * 1000);
    const remainingMl = Math.max(0, targetMl - todayWaterLoggedMl);
    const progressPct = Math.min(100, Math.round((todayWaterLoggedMl / targetMl) * 100));

    const title = '💧 Hydration Break Reminder!';
    const body = `You are at ${progressPct}% of your ${targetMl}ml daily goal. Drink a 250ml glass of water now (${remainingMl}ml remaining)!`;

    setActiveAlert({
      title,
      body,
      type: 'hydration',
    });
    setLastNotificationTime(new Date());
    sendBrowserNotification(title, body);
  }, [todayWaterLoggedMl, waterTargetLiters, sendBrowserNotification]);

  // Trigger Healthy Snack Suggestion Notification
  const triggerSnackAlert = useCallback(() => {
    const snack = recommendedSnack;
    const title = `🥗 Healthy Snack Suggestion: ${snack.name}`;
    const body = `${snack.description} (${snack.calories} kcal | ${snack.protein}g Protein). Benefits: ${snack.benefits}`;

    setActiveAlert({
      title,
      body,
      type: 'snack',
      snack,
    });
    setLastNotificationTime(new Date());
    sendBrowserNotification(title, body);
  }, [recommendedSnack, sendBrowserNotification]);

  // Periodic Auto-Reminder Loop based on selected interval
  useEffect(() => {
    if (!notificationsEnabled) return;

    const msInterval = reminderIntervalMins * 60 * 1000;
    const timer = setInterval(() => {
      // Alternates between hydration break and snack suggestion
      if (Math.random() > 0.5) {
        triggerHydrationAlert();
      } else {
        triggerSnackAlert();
      }
    }, msInterval);

    return () => clearInterval(timer);
  }, [notificationsEnabled, reminderIntervalMins, triggerHydrationAlert, triggerSnackAlert]);

  // Quick Action: Log Water Intake
  const handleLogWater = (ml: number) => {
    const newTotal = todayWaterLoggedMl + ml;
    setTodayWaterLoggedMl(newTotal);

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HYDRATION_LOG);
      let parsed = { date: new Date().toISOString().split('T')[0], intakeMl: 0, goalMl: 2500, streakDays: 1 };
      if (saved) parsed = JSON.parse(saved);
      parsed.intakeMl = newTotal;
      localStorage.setItem(LOCAL_STORAGE_KEY_HYDRATION_LOG, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to update hydration storage:', e);
    }

    setActiveAlert(null);
  };

  return (
    <Card className="my-6 border border-emerald-200 dark:border-emerald-900/80 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Top Banner Header */}
      <CardHeader className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 border-b border-emerald-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
              <BellRing className="w-6 h-6 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-xl font-black text-white">
                  Browser Smart Notification Engine
                </CardTitle>
                <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-bold">
                  Web Push API
                </Badge>
              </div>
              <CardDescription className="text-xs text-emerald-200/80 mt-0.5">
                Automated hydration break triggers & goal-based healthy snack recommendations tuned to your calculator profile
              </CardDescription>
            </div>
          </div>

          {/* Browser Notification Permission Button */}
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <Badge className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Browser Notifications Granted
              </Badge>
            ) : permission === 'denied' ? (
              <Badge variant="destructive" className="px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                <BellOff className="w-4 h-4" />
                Notifications Blocked
              </Badge>
            ) : (
              <Button
                onClick={requestBrowserPermission}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl px-3.5 py-1.5 gap-1.5 shadow-md"
              >
                <Bell className="w-4 h-4" />
                Allow Web Notifications
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Controls & Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          {/* Notification Master Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <Switch
              id="notifToggle"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <label htmlFor="notifToggle" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              Auto Reminders {notificationsEnabled ? 'Active' : 'Paused'}
            </label>
          </div>

          {/* Sound Chime Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <Switch
              id="soundToggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
            <label htmlFor="soundToggle" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1">
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              Audio Chime {soundEnabled ? 'On' : 'Muted'}
            </label>
          </div>

          {/* Reminder Interval Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              Interval Frequency
            </label>
            <Select value={String(reminderIntervalMins)} onValueChange={(v) => setReminderIntervalMins(Number(v))}>
              <SelectTrigger className="h-8 rounded-lg text-xs font-bold bg-white dark:bg-slate-900">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="text-xs rounded-xl z-50">
                <SelectItem value="30">Every 30 Minutes (High Frequency)</SelectItem>
                <SelectItem value="60">Every 60 Minutes (Standard)</SelectItem>
                <SelectItem value="90">Every 90 Minutes (Relaxed)</SelectItem>
                <SelectItem value="120">Every 2 Hours (Minimal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Snack Preference Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              Snack Strategy
            </label>
            <Select value={snackPreference} onValueChange={(v) => setSnackPreference(v as any)}>
              <SelectTrigger className="h-8 rounded-lg text-xs font-bold bg-white dark:bg-slate-900">
                <SelectValue placeholder="Snack Type" />
              </SelectTrigger>
              <SelectContent className="text-xs rounded-xl z-50">
                <SelectItem value="all">Balanced All Types</SelectItem>
                <SelectItem value="high_protein">High Protein (&gt;10g)</SelectItem>
                <SelectItem value="low_calorie">Low Calorie (&lt;120 kcal)</SelectItem>
                <SelectItem value="hydration">Electrolyte & Hydrating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Trigger Buttons & Active Alert Notification Card */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Instant Activity Notification Triggers
            </span>

            <div className="flex items-center gap-2">
              <Button
                onClick={triggerHydrationAlert}
                variant="outline"
                className="bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs rounded-xl h-8 gap-1.5"
              >
                <Droplet className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                Test Hydration Break
              </Button>

              <Button
                onClick={triggerSnackAlert}
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs rounded-xl h-8 gap-1.5"
              >
                <Apple className="w-3.5 h-3.5 text-emerald-600" />
                Suggest Healthy Snack
              </Button>
            </div>
          </div>

          {/* Active In-App Notification Toast Banner */}
          <AnimatePresence mode="wait">
            {activeAlert ? (
              <motion.div
                key={activeAlert.title}
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                className={`p-4 rounded-2xl border shadow-md relative overflow-hidden ${
                  activeAlert.type === 'hydration'
                    ? 'bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white border-sky-600/50'
                    : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white border-emerald-600/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border mt-0.5 ${
                      activeAlert.type === 'hydration' 
                        ? 'bg-sky-500/20 border-sky-400/40 text-sky-300' 
                        : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    }`}>
                      {activeAlert.type === 'hydration' ? (
                        <Droplet className="w-5 h-5 text-sky-400 animate-bounce" fill="currentColor" />
                      ) : (
                        <Apple className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white">{activeAlert.title}</h4>
                        <Badge className="bg-amber-400 text-slate-950 font-black text-[9px]">
                          Live Recommendation
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-xl">
                        {activeAlert.body}
                      </p>

                      {/* If Snack recommendation, display macros detail pill */}
                      {activeAlert.snack && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-200">
                            🔥 {activeAlert.snack.calories} kcal
                          </span>
                          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-200">
                            💪 {activeAlert.snack.protein}g Protein
                          </span>
                          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-200">
                            🥑 {activeAlert.snack.fat}g Healthy Fat
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notification Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0">
                    {activeAlert.type === 'hydration' ? (
                      <Button
                        onClick={() => handleLogWater(250)}
                        className="bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs rounded-xl h-8 px-3 gap-1 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Log +250ml Water
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setActiveAlert(null)}
                        className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl h-8 px-3 gap-1 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Snack Logged
                      </Button>
                    )}
                    <Button
                      onClick={() => setActiveAlert(null)}
                      variant="ghost"
                      className="text-xs text-slate-300 hover:text-white h-8 px-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>
                    Notification Scheduler Standby. Next automated check in <strong>{reminderIntervalMins} minutes</strong>.
                  </span>
                </div>
                {lastNotificationTime && (
                  <span className="text-[10px] text-slate-400">
                    Last sent: {lastNotificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Featured Healthy Snack Recommendations Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-600" />
              NutriGlobe Recommended Clinical Snacks Library
            </h4>
            <span className="text-[10px] text-slate-500">Tailored to TDEE & Goal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HEALTHY_SNACKS.map((snack) => (
              <div
                key={snack.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{snack.name}</h5>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-mono">
                    {snack.calories} kcal
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {snack.description}
                </p>
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="text-emerald-600 dark:text-emerald-400">💪 {snack.protein}g Protein</span>
                  <span className="text-amber-600 dark:text-amber-400">🥑 {snack.fat}g Fat</span>
                  <span className="text-sky-600 dark:text-sky-400">🌾 {snack.carbs}g Carbs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
