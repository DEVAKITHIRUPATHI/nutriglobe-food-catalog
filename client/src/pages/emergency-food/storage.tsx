import React from 'react';
import { Link } from 'wouter';
import { 
  Package, ShieldCheck, Thermometer, Droplets, AlertTriangle, 
  ArrowLeft, CheckCircle2, Info, Layers, Wind, Bug
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EmergencyStoragePage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Food Storage &amp; Flood Safety</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Package className="w-3.5 h-3.5" />
          <span>Long-Term Pantry Defense &amp; Preservation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Food Storage, Environmental Preservation &amp; Flood Safety
        </h1>
        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-serif">
          உணவு சேமிப்பு நுட்பங்கள் மற்றும் வெள்ள நீர் பாதுகாப்பு வழிகாட்டி
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Tropical humidity, monsoonal mold (Aspergillus aflatoxins), and pest vectors destroy unprotected pantry reserves faster than time. Learn clinical preservation standards for long-term survival stockpiling.
        </p>
      </div>

      {/* 4 Pillars of Emergency Storage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-2xl w-fit">
            <Droplets className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Moisture Defense (&lt; 10%)</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Keep dry grains (millets, rice, dal) under 10% relative moisture to inhibit weevils and fungal sporulation. Use food-grade silica gel desiccant packs.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-2xl w-fit">
            <Thermometer className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Thermal Range (10° - 21°C)</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every 10°C drop in storage temperature doubles shelf-life. Store emergency caches on ground floor interior closets away from attic and exterior sun walls.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-2xl w-fit">
            <Wind className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Oxygen Scavengers</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Oxygen oxidizes essential lipids and causes rancidity in nuts and whole grains. Mylar bags paired with 300cc–500cc iron-powder oxygen absorbers create an anaerobic seal.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl w-fit">
            <Bug className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Rodent &amp; Pest Shield</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Rats chew through cardboard and standard polythene in seconds. Keep dry foods inside food-grade HDPE 5-gallon buckets with gamma-seal lids elevated 2ft above the floor.
          </p>
        </div>
      </div>

      {/* Packaging Hierarchy Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Packaging Comparison &amp; Viability Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] border-b">
              <tr>
                <th className="py-2.5 px-3">Packaging Medium</th>
                <th className="py-2.5 px-3">Waterproof Rating</th>
                <th className="py-2.5 px-3">Flood Protection</th>
                <th className="py-2.5 px-3">Rodent Protection</th>
                <th className="py-2.5 px-3">Expected Shelf Life</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Commercial Metal Cans (Hermetic)</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">100% Hermetic</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Full (Sanitize with bleach)</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Impervious</td>
                <td className="py-3 px-3 font-mono">24 – 60+ Months</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Mylar Heat-Sealed Bags with O2 Absorber</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">100% Watertight</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">High (if seal intact)</td>
                <td className="py-3 px-3 text-rose-500 font-bold">Vulnerable (Must place in bin)</td>
                <td className="py-3 px-3 font-mono">12 – 36 Months</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Food-Grade HDPE Plastic Buckets</td>
                <td className="py-3 px-3 text-teal-600 font-bold">Splash Resistant</td>
                <td className="py-3 px-3 text-teal-600 font-bold">Moderate (if submersed, seal may leak)</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Strong defense</td>
                <td className="py-3 px-3 font-mono">12 – 24 Months</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Cardboard Boxes &amp; Paper Bags</td>
                <td className="py-3 px-3 text-rose-500 font-bold">0% (Absorbent)</td>
                <td className="py-3 px-3 text-rose-500 font-bold">ZERO (Discard immediately)</td>
                <td className="py-3 px-3 text-rose-500 font-bold">ZERO (Readily chewed)</td>
                <td className="py-3 px-3 font-mono">1 – 3 Months in Monsoon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FEFO Rotation Strategy */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          The FEFO Principle (First-Expired, First-Out)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Never let an emergency cache sit unmonitored for years. Organize your pantry by placing newly purchased items behind older stock. Mark dates on the front of packages in black permanent marker. Consume items reaching 75% of their shelf life during normal weekly family meals, immediately replacing them with fresh stock.
        </p>
      </div>
    </div>
  );
}
