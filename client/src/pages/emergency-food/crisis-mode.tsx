import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Flame, AlertTriangle, ShieldAlert, Clock, Droplets, 
  ArrowLeft, CheckCircle2, XCircle, HelpCircle, Utensils,
  Zap, Info, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CrisisModePage() {
  const [powerElapsedHours, setPowerElapsedHours] = useState<number>(3);
  const [floodwaterContact, setFloodwaterContact] = useState<boolean>(false);
  const [gasLeakSuspected, setGasLeakSuspected] = useState<boolean>(false);

  // Determine Refrigerator Safety Status
  const getFridgeStatus = () => {
    if (powerElapsedHours <= 4) {
      return {
        safe: true,
        level: 'SAFE_LIMITED',
        text: 'Food in unopened refrigerator remains generally safe under 4°C (40°F). Keep door closed!',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      };
    } else if (powerElapsedHours <= 6) {
      return {
        safe: false,
        level: 'WARNING',
        text: 'Perishable window expired! Discard raw poultry, meat, seafood, soft cheeses, and cooked leftovers held above 4°C for over 2 hours.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      };
    } else {
      return {
        safe: false,
        level: 'DANGER',
        text: 'Severe bacterial risk (Salmonella, Listeria, E. coli). Discard ALL perishable items in refrigerator immediately. Never taste test!',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/30'
      };
    }
  };

  const fridgeStatus = getFridgeStatus();

  return (
    <div className="space-y-8 pb-16">
      {/* High-Contrast Crisis Header */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/emergency-food" className="hover:text-rose-500 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-rose-400 font-semibold">Active Crisis Mode</span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-black text-white border-2 border-rose-600/60 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 text-white rounded-2xl animate-pulse">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
              Immediate Incident Response Triage
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">
              Active Crisis Triage Wizard
            </h1>
            <p className="text-base font-bold text-rose-300 font-serif">
              உடனடி பேரிடர் அவசர உதவி &amp; உணவுப் பாதுகாப்பு
            </p>
          </div>
        </div>

        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          Use this interactive triage when facing sudden power cuts, floodwater breaching your home, or culinary utility shutdowns. Do not guess—foodborne botulism and enterotoxin poisoning thrive in uncooled foods.
        </p>
      </div>

      {/* Triage Section 1: Power Outage Elapsed Clock */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              1. Elapsed Power Outage Time (மின் தடை நேரம்)
            </h2>
            <p className="text-xs text-slate-500">
              CDC Standard: Unopened refrigerators keep food cold for maximum 4 hours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 4, 6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setPowerElapsedHours(hours)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  powerElapsedHours === hours
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Current Verdict Banner */}
        <div className={`p-4 rounded-2xl border ${fridgeStatus.color} space-y-1`}>
          <div className="font-extrabold text-sm flex items-center gap-2">
            {fridgeStatus.safe ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
            <span>Verdict after {powerElapsedHours} Hours without Electricity:</span>
          </div>
          <p className="text-xs leading-relaxed">{fridgeStatus.text}</p>
        </div>

        {/* Action Table: Keep vs Discard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <span className="font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Discard if held &gt; 2h above 4°C
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Raw or cooked meat, poultry, fish, seafood</li>
              <li>• Soft cheeses (paneer, ricotta, mozzarella, cottage cheese)</li>
              <li>• Milk, cream, sour cream, yogurt, opened baby formula</li>
              <li>• Cooked pasta, cooked rice, cut melons, cut leafy greens</li>
              <li>• Mayonnaise, tartar sauce, opened creamy dressings</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Safe to Keep Even After Prolonged Blackout
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Hard cheeses (cheddar, parmesan, processed block cheese)</li>
              <li>• Butter, ghee, margarine in covered dishes</li>
              <li>• Fresh whole uncut fruits and raw vegetables</li>
              <li>• Bread, rolls, cakes, muffins, tortillas</li>
              <li>• Peanut butter, jelly, jam, mustard, pickles, soy sauce</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Triage Section 2: Floodwater Ingress Audit */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          2. Floodwater Contamination Checklist (வெள்ள நீர் பாதிப்பு)
        </h2>
        <p className="text-xs text-slate-500">
          Floodwaters carry industrial effluents, raw sewage, and bacterial pathogens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <span className="font-extrabold text-rose-800 dark:text-rose-300 uppercase">
              Immediate Discard (Unsalvageable Packaging)
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Discard ANY food in:
            </p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• Screw caps, snap lids, crimped caps, twist caps (pathogens enter threads)</li>
              <li>• Cardboard boxes, paper juice/milk cartons, plastic bags, home canned jars</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 space-y-2">
            <span className="font-extrabold text-teal-800 dark:text-teal-300 uppercase">
              Sanitizing Undamaged Commercial Cans
            </span>
            <ol className="space-y-1 text-slate-700 dark:text-slate-300 list-decimal list-inside">
              <li>Remove paper labels (which harbor mold/bacteria).</li>
              <li>Wash cans with soap and potable hot water.</li>
              <li>Submerge in 1 tbsp household bleach per 1 gallon of water for 1 minute.</li>
              <li>Air dry thoroughly and relabel with permanent marker before opening.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Triage Section 3: Emergency Zero-Cook Meal Generator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-600" />
          3. Zero-Fuel Disaster Meals Ready in Under 5 Minutes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Sweet Energy Aval (அவல்)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Cover flattened rice (Aval) with cold potable water for 8 minutes. Drain excess, mix with crushed jaggery (vellam), roasted peanuts, and a pinch of cardamom.
            </p>
            <div className="font-mono text-[11px] font-bold text-emerald-600">~420 kcal • 9g Protein • Zero Fuel</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Protein Pori Chaat (பொரி)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Toss puffed rice (pori) with roasted Bengal gram (pottukadalai), raw peanuts, lemon juice, turmeric, and a dash of mustard oil.
            </p>
            <div className="font-mono text-[11px] font-bold text-emerald-600">~380 kcal • 14g Protein • Zero Fuel</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">Nutrient Sattu Elixir</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Dissolve 4 tbsp roasted chickpea flour (sattu) in 250ml water with roasted cumin and rock salt (or jaggery). Drink immediately.
            </p>
            <div className="font-mono text-[11px] font-bold text-emerald-600">~260 kcal • 12g Protein • Zero Fuel</div>
          </div>
        </div>
      </div>
    </div>
  );
}
