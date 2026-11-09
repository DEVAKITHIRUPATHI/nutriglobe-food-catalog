import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Droplets, ShieldCheck, AlertTriangle, ArrowLeft, 
  Flame, Sun, CheckCircle2, Info, Plus, Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function EmergencyWaterPage() {
  const [adultCount, setAdultCount] = useState<number>(3);
  const [childCount, setChildCount] = useState<number>(1);
  const [days, setDays] = useState<number>(7);
  const [climateHeat, setClimateHeat] = useState<boolean>(true);

  // Calculations per WHO Sphere and CDC Standards
  // Adults: 3.0L/day temperate, 4.5L/day in heat/manual labor
  // Children: 1.5L/day temperate, 2.5L/day in heat
  const adultDailyLiters = climateHeat ? 4.5 : 3.0;
  const childDailyLiters = climateHeat ? 2.5 : 1.5;

  const totalDrinkingLiters = Math.round(((adultCount * adultDailyLiters) + (childCount * childDailyLiters)) * days);
  const foodPrepLiters = Math.round(((adultCount + childCount) * 1.0) * days);
  const hygieneLiters = Math.round(((adultCount + childCount) * 2.0) * days);
  const grandTotalLiters = totalDrinkingLiters + foodPrepLiters + hygieneLiters;

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Potable Water &amp; Disinfection</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Droplets className="w-3.5 h-3.5" />
          <span>WHO &amp; CDC Standard Water Calculations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Emergency Potable Water Calculator &amp; Disinfection
        </h1>
        <p className="text-lg font-bold text-teal-600 dark:text-teal-400 font-serif">
          அவசரகால குடிநீர் கணக்கீடு மற்றும் கிருமிநாசினி முறைகள்
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Human survival without water collapses within 72 hours. Water for drinking must be strictly segregated from food rehydration and sanitation. Never consume unboiled floodwater or flood-compromised tap supply.
        </p>
      </div>

      {/* Interactive Water Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-teal-600" />
            Household Water Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-800 dark:text-slate-200">Adults (18+y)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm">{adultCount}</span>
                <button
                  onClick={() => setAdultCount(adultCount + 1)}
                  className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-800 dark:text-slate-200">Children / Infants</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChildCount(Math.max(0, childCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm">{childCount}</span>
                <button
                  onClick={() => setChildCount(childCount + 1)}
                  className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-bold text-slate-800 dark:text-slate-200">Reserve Days</span>
              <div className="flex items-center gap-1.5">
                {[3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      days === d ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Tropical Heatwave?</span>
                <span className="text-[10px] text-slate-400">Increases hydration to 4.5L/day</span>
              </div>
              <input
                type="checkbox"
                checked={climateHeat}
                onChange={(e) => setClimateHeat(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600"
              />
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-teal-800 dark:text-teal-300">Drinking Only</span>
              <div className="text-3xl font-black text-teal-900 dark:text-teal-100">{totalDrinkingLiters} L</div>
              <span className="text-[10px] text-teal-600 font-semibold">{days} days potable reserve</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300">Food Preparation</span>
              <div className="text-3xl font-black text-blue-900 dark:text-blue-100">{foodPrepLiters} L</div>
              <span className="text-[10px] text-blue-600 font-semibold">Soaking &amp; minimal boil</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-300">Basic Hygiene</span>
              <div className="text-3xl font-black text-purple-900 dark:text-purple-100">{hygieneLiters} L</div>
              <span className="text-[10px] text-purple-600 font-semibold">2L / person / day</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400">Total Volume</span>
              <div className="text-3xl font-black text-white">{grandTotalLiters} L</div>
              <span className="text-[10px] text-slate-400 font-mono">~{Math.ceil(grandTotalLiters / 20)} 20L Carboys</span>
            </div>
          </div>

          {/* Emergency Purification Methods */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Approved Emergency Disinfection Methods (CDC / WHO)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Rolling Boil (Gold Standard)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Bring clear water to a vigorous rolling boil for at least <strong>1 full minute</strong> (3 minutes at elevations &gt; 2,000m). Kills bacteria, viruses, and giardia/cryptosporidium cysts.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  Household Chlorine Bleach
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Use regular unscented 6-8.25% sodium hypochlorite bleach. Add <strong>6 to 8 drops (approx. 1/8 teaspoon) per 1 gallon (3.78L)</strong>. Stir and let sit for 30 minutes before drinking.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Solar Disinfection (SODIS)
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  Fill clean transparent PET bottles (max 2L) with clear water and lay horizontally in full sunlight for at least <strong>6 hours</strong> (or 2 days if cloudy). UV-A and thermal pasteurization inactivate pathogens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
