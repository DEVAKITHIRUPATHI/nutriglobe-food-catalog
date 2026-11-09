import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Users, ShieldCheck, Droplets, Utensils, ArrowLeft, 
  CheckCircle2, AlertTriangle, FileText, Download, Printer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CommunityReliefPage() {
  const [headcount, setHeadcount] = useState<number>(100);
  const [reliefDays, setReliefDays] = useState<number>(7);

  // FSSAI & WHO Humanitarian Mass Relief Standard Rations (per person per day)
  // Grains: 400g/day (Rice/Millets/Aval)
  // Pulses: 80g/day (Moong dal / Roasted gram)
  // Lipids/Oil: 30g/day (Vegetable oil / Mustard oil)
  // Jaggery/Sugar: 40g/day
  // Iodized Salt: 10g/day
  // Drinking Water: 3.5L/person/day
  // Bulk Cooking Water: 1.5L/person/day

  const totalGrainKg = ((headcount * 0.4) * reliefDays).toFixed(0);
  const totalPulseKg = ((headcount * 0.08) * reliefDays).toFixed(0);
  const totalOilKg = ((headcount * 0.03) * reliefDays).toFixed(0);
  const totalJaggeryKg = ((headcount * 0.04) * reliefDays).toFixed(0);
  const totalSaltKg = ((headcount * 0.01) * reliefDays).toFixed(0);
  const totalDrinkingWaterLiters = Math.round(headcount * 3.5 * reliefDays);
  const totalCookWaterLiters = Math.round(headcount * 1.5 * reliefDays);
  const grandTotalWaterLiters = totalDrinkingWaterLiters + totalCookWaterLiters + Math.round(headcount * 2.0 * reliefDays);

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 print:hidden">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Community Relief &amp; Mass Feeding</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>FSSAI &amp; WHO Mass Feeding Rations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Community Disaster Relief &amp; Mass Kitchen Feeding
        </h1>
        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-serif">
          சமூக பேரிடர் நிவாரண முகாம் &amp; பொது சமையலறை உணவுத் திட்டம்
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Standardized procurement quotas and safety directives for disaster relief camps, NGO shelters, and local panchayat kitchens. Guaranteed 2,100 kcal energy and 55g protein per displaced citizen.
        </p>
      </div>

      {/* Headcount & Duration Controls */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">Camp Beneficiary Population:</span>
          {[50, 100, 250, 500, 1000].map(count => (
            <button
              key={count}
              onClick={() => setHeadcount(count)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                headcount === count ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {count} People
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">Duration:</span>
          {[3, 7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setReliefDays(d)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                reliefDays === d ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Procurement Quotas Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Staple Grains</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalGrainKg} kg</div>
          <span className="text-[10px] text-slate-400">Rice / Aval / Millets</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600">Pulses / Dal</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalPulseKg} kg</div>
          <span className="text-[10px] text-slate-400">Moong / Roasted Gram</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-amber-600">Edible Oil</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalOilKg} kg</div>
          <span className="text-[10px] text-slate-400">Mustard / Groundnut Oil</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-purple-600">Jaggery / Sugar</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalJaggeryKg} kg</div>
          <span className="text-[10px] text-slate-400">Mineral &amp; Iron Energy</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-blue-600">Iodized Salt</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalSaltKg} kg</div>
          <span className="text-[10px] text-slate-400">Electrolyte stability</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-teal-800 dark:text-teal-300">Drinking Water</span>
          <div className="text-2xl font-black text-teal-900 dark:text-teal-100">{totalDrinkingWaterLiters.toLocaleString()} L</div>
          <span className="text-[10px] text-teal-600 font-semibold">Certified potable</span>
        </div>
      </div>

      {/* FSSAI Disaster Relief Kitchen Hygiene Directives */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          FSSAI Disaster Kitchen Operating Directives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              1. Communal Kitchen Chlorination Standard
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              All bulk water tankers must be tested for free residual chlorine (minimum 0.5 mg/L at the tap). Water storage tanks must remain covered with fine mosquito netting and secured lids.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              2. Single-Session Cook and Serve Rule
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Cooked meals (Khichdi, Pongal, Dal-Rice) must be distributed within <strong>2 hours</strong> of preparation. Storing mass cooked rice or lentils overnight without commercial refrigeration causes fatal Bacillus cereus food poisoning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
