import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Utensils, Users, Droplets, Flame, ShieldCheck, Printer, 
  Download, ArrowLeft, CheckCircle2, AlertTriangle, Plus, Minus,
  Calendar, Clock, Heart, Apple, Info, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HouseholdMemberRoster {
  adults: number;
  children: number;
  infants: number;
  elderly: number;
  pregnantOrLactating: number;
}

interface HouseholdInfrastructureStatus {
  cookingFuelAvailable: boolean;
  cleanPotableWaterLiters: number;
  electricityWorking: boolean;
  refrigeratorFunctional: boolean;
  hasAirtightStorageContainers: boolean;
}

interface EmergencyRationItemRequirement {
  foodId: string;
  foodName: string;
  foodNameTamil: string;
  category: string;
  dailyServingGrams: number;
  totalGramsForPeriod: number;
  totalCalories: number;
  totalProteinGrams: number;
  preparationType: string;
  requiresCooking: boolean;
  waterRequiredLiters: number;
}

interface HouseholdEmergencyPlan {
  planId: string;
  household: HouseholdMemberRoster;
  infrastructure: HouseholdInfrastructureStatus;
  durationDays: 3 | 7 | 15 | 30;
  totalDailyCaloriesNeeded: number;
  totalDailyProteinNeededGrams: number;
  totalDrinkingWaterLiters: number;
  totalFoodPrepWaterLiters: number;
  totalHygieneWaterLiters: number;
  grandTotalWaterLiters: number;
  rations: EmergencyRationItemRequirement[];
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    emergencySnacks: string[];
  };
  safetyChecklist: string[];
  createdAt: string;
}

export default function HouseholdEmergencyPlanner() {
  const [roster, setRoster] = useState<HouseholdMemberRoster>({
    adults: 2,
    children: 1,
    infants: 0,
    elderly: 0,
    pregnantOrLactating: 0
  });

  const [infra, setInfra] = useState<HouseholdInfrastructureStatus>({
    cookingFuelAvailable: false,
    cleanPotableWaterLiters: 20,
    electricityWorking: false,
    refrigeratorFunctional: false,
    hasAirtightStorageContainers: true
  });

  const [durationDays, setDurationDays] = useState<3 | 7 | 15 | 30>(7);
  const [plan, setPlan] = useState<HouseholdEmergencyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePlan = () => {
    setLoading(true);
    fetch('/api/emergency-food/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        household: roster,
        infrastructure: infra,
        durationDays
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.plan) {
          setPlan(data.plan);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to compute emergency plan:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    calculatePlan();
  }, [roster, infra, durationDays]);

  const handleRosterChange = (key: keyof HouseholdMemberRoster, delta: number) => {
    setRoster(prev => {
      const val = Math.max(0, prev[key] + delta);
      // At least 1 adult or elderly required
      if (key === 'adults' && val === 0 && prev.elderly === 0) return prev;
      return { ...prev, [key]: val };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 print:hidden">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Household Survival Planner</span>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-3.5 h-3.5" />
            <span>WHO &amp; ICMR-NIN Rationing Algorithms</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Household Survival Food &amp; Water Planner
          </h1>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 font-serif">
            குடும்ப உயிர்வாழ்வு உணவு மற்றும் குடிநீர் திட்டமிடல்
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-2 border-slate-300 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print Survival Card</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Grid: Controls (Left) vs Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs & Constraints */}
        <div className="space-y-6 print:hidden">
          {/* Household Roster Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              1. Household Composition
            </h2>

            <div className="space-y-3">
              {[
                { key: 'adults' as const, label: 'Adults (18-64y)', baseline: '2,100 kcal / 55g protein' },
                { key: 'children' as const, label: 'Children (1-10y)', baseline: '1,500 kcal / 30g protein' },
                { key: 'infants' as const, label: 'Infants (0-1y)', baseline: '750 kcal / Formula or Milk' },
                { key: 'elderly' as const, label: 'Elderly (65+y)', baseline: '1,800 kcal / 50g protein' },
                { key: 'pregnantOrLactating' as const, label: 'Pregnant / Nursing', baseline: '2,500 kcal / 70g protein' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.baseline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRosterChange(item.key, -1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-slate-900 dark:text-white">
                      {roster[item.key]}
                    </span>
                    <button
                      onClick={() => handleRosterChange(item.key, 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs hover:bg-emerald-500 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              2. Emergency Target Duration
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { days: 3, label: '3 Days', desc: 'FEMA Survival Baseline' },
                { days: 7, label: '7 Days', desc: 'NDMA Coastal Cyclone Standard' },
                { days: 15, label: '15 Days', desc: 'Extended Isolation' },
                { days: 30, label: '30 Days', desc: 'Full Pantry Buffer' }
              ].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setDurationDays(opt.days as any)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    durationDays === opt.days
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-black text-sm">{opt.label}</div>
                  <div className={`text-[10px] ${durationDays === opt.days ? 'text-blue-100' : 'text-slate-400'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Infrastructure & Utilities Toggles */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              3. Utility &amp; Fuel Status
            </h2>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Cooking Fuel / LPG Available?</span>
                  <span className="text-[10px] text-slate-400">If unchecked, auto-switches to 100% no-cook rations</span>
                </div>
                <input
                  type="checkbox"
                  checked={infra.cookingFuelAvailable}
                  onChange={(e) => setInfra(prev => ({ ...prev, cookingFuelAvailable: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Electricity / Grid Working?</span>
                  <span className="text-[10px] text-slate-400">Uncheck if blackout active</span>
                </div>
                <input
                  type="checkbox"
                  checked={infra.electricityWorking}
                  onChange={(e) => setInfra(prev => ({ ...prev, electricityWorking: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Airtight Containers on Hand?</span>
                  <span className="text-[10px] text-slate-400">Required for monsoon pest/fungal prevention</span>
                </div>
                <input
                  type="checkbox"
                  checked={infra.hasAirtightStorageContainers}
                  onChange={(e) => setInfra(prev => ({ ...prev, hasAirtightStorageContainers: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (2 Columns wide): Calculated Survival Ration Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {plan ? (
            <>
              {/* Summary 4-Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Daily Calories</span>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                    {plan.totalDailyCaloriesNeeded.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">kcal/day for household</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">Daily Protein</span>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-100">
                    {plan.totalDailyProteinNeededGrams}g
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">grams/day minimum</span>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-teal-800 dark:text-teal-300">Drinking Water</span>
                  <div className="text-2xl font-black text-teal-900 dark:text-teal-100">
                    {plan.totalDrinkingWaterLiters} L
                  </div>
                  <span className="text-[10px] text-teal-600 font-medium">for {durationDays} days (WHO standard)</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Grand Total Water</span>
                  <div className="text-2xl font-black text-purple-900 dark:text-purple-100">
                    {plan.grandTotalWaterLiters} L
                  </div>
                  <span className="text-[10px] text-purple-600 font-medium">drink + food prep + hygiene</span>
                </div>
              </div>

              {/* Water Requirement Breakdown Detail */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  Total Water Accounting for {durationDays} Days
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Pure Drinking Water</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">{plan.totalDrinkingWaterLiters} Liters</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Food Prep / Rehydration</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">{plan.totalFoodPrepWaterLiters} Liters</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Sanitary / Hygiene</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">{plan.totalHygieneWaterLiters} Liters</strong>
                  </div>
                </div>
              </div>

              {/* Rations Line-Items Table */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    Essential Survival Rations Checklist ({durationDays} Days)
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700">
                    {!infra.cookingFuelAvailable ? '100% No-Cook Mode' : 'Standard Fuel Mode'}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Survival Item</th>
                        <th className="py-2.5 px-3">Preparation</th>
                        <th className="py-2.5 px-3">Daily Grams</th>
                        <th className="py-2.5 px-3">Total Required</th>
                        <th className="py-2.5 px-3">Calories</th>
                        <th className="py-2.5 px-3">Protein</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {plan.rations.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 dark:text-white">{item.foodName}</div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-serif font-bold">{item.foodNameTamil}</div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="secondary" className="text-[10px]">
                              {item.preparationType.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                            {item.dailyServingGrams}g
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-emerald-700 dark:text-emerald-400">
                            {(item.totalGramsForPeriod / 1000).toFixed(2)} kg
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                            {item.totalCalories.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                            {item.totalProteinGrams}g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Emergency Daily Meal Schedule */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Recommended Daily Meal Schedule (Disaster Conditions)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] text-emerald-600">Breakfast</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {plan.mealPlan.breakfast.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] text-blue-600">Lunch</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {plan.mealPlan.lunch.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] text-purple-600">Dinner</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {plan.mealPlan.dinner.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase text-[10px] text-amber-600">Emergency Energy Snacks</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                      {plan.mealPlan.emergencySnacks.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Crucial Survival Directives Checklist */}
              <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-3 text-xs">
                <span className="font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Mandatory Disaster Safety Directives
                </span>
                <ul className="space-y-1.5 text-amber-900 dark:text-amber-200/90">
                  {plan.safetyChecklist.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">Computing household plan...</div>
          )}
        </div>
      </div>
    </div>
  );
}
