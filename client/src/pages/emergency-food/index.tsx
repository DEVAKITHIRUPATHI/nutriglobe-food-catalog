import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  AlertTriangle, ShieldCheck, Flame, Droplets, Clock, 
  Package, Compass, Utensils, Download, ArrowRight, HeartPulse,
  Sparkles, CheckCircle2, ChevronRight, Filter, Search, FileText,
  Activity, Zap, Info, Thermometer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface EmergencyCatalogAuditResponse {
  status: string;
  totalCatalogFoods: number;
  evaluatedAt: string;
  standardsApplied: string[];
  metrics: {
    readyToEatCount: number;
    coldSoakableCount: number;
    minimalBoilCount: number;
    fullCookCount: number;
    refrigerationDependentCount: number;
    shelfStableLongTermCount: number;
    perishableCount: number;
    zeroFuelRequiredCount: number;
    zeroWaterRequiredCount: number;
    highCaloricDensityCount: number;
    highProteinCount: number;
  };
  topImmediateDisasterStaples: Array<{
    foodId: string;
    canonicalSlug: string;
    foodNameEnglish: string;
    foodNameTamil: string;
    scientificName: string;
    category: string;
    primaryClassification: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    waterRequirement: string;
    shelfLifeMonths: number;
  }>;
}

export default function EmergencyFoodHub() {
  const [auditData, setAuditData] = useState<EmergencyCatalogAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'preparedness' | 'crisis'>('preparedness');

  useEffect(() => {
    fetch('/api/emergency-food/catalog-audit')
      .then(res => res.json())
      .then(data => {
        setAuditData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load emergency catalog audit:', err);
        setLoading(false);
      });
  }, []);

  const staples = auditData?.topImmediateDisasterStaples || [];

  const filteredStaples = staples.filter(item => {
    const matchesSearch = 
      item.foodNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foodNameTamil.includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && item.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Emergency Readiness Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-10 border border-emerald-800/40 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WHO & NDMA India Evidence-Based Disaster Intelligence</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Natural Disaster, Emergency Food Intelligence &amp; Survival Management
            </h1>
            <p className="text-xl font-bold text-emerald-300/90 font-serif">
              அவசரகால உணவு மற்றும் பேரிடர் தயார்நிலை மேலாண்மை
            </p>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Clinically maps NutriFacts' master catalog of 1,379 foods against 18 disaster scenarios (floods, cyclones, earthquakes, and blackouts). Provides instant survival rationing, no-cook nutrition algorithms, floodwater contamination rules, and potable water calculations without guesswork.
          </p>

          {/* Quick Dual Mode Switcher */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="bg-black/40 p-1 rounded-2xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setViewMode('preparedness')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                  viewMode === 'preparedness'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/60'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-300" />
                <span>Preparedness &amp; Stockpiling (தயார்நிலை)</span>
              </button>

              <button
                onClick={() => setViewMode('crisis')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                  viewMode === 'crisis'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/60'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-300 animate-pulse" />
                <span>Active Crisis Mode (பேரிடர் நிகழ்வு)</span>
              </button>
            </div>

            <a
              href="/api/emergency-food/export/csv"
              download="nutrifacts_emergency_food_catalog_audit_1379.csv"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Full 1,379 Audit CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Immediate Crisis Mode Quick Warning Box (Shown when Crisis Mode is selected) */}
      {viewMode === 'crisis' && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border-2 border-rose-500/60 text-rose-100 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-2xl">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Immediate Disaster Triage Protocols Active</h2>
              <p className="text-xs text-rose-200">Standard operating procedures from CDC, WHO, and FEMA.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/30 space-y-1.5">
              <span className="font-extrabold uppercase text-amber-300 tracking-wider text-[11px]">Power Outage Clock</span>
              <p className="text-rose-100 leading-relaxed">
                Unopened refrigerator is safe for max <strong>4 hours</strong>. Freezer holds temperature for 48h (if full). Discard meat, poultry, fish, and soft dairy held above 4°C for over 2 hours.
              </p>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/30 space-y-1.5">
              <span className="font-extrabold uppercase text-amber-300 tracking-wider text-[11px]">Floodwater Ingress</span>
              <p className="text-rose-100 leading-relaxed">
                Discard all foods in cardboard, paper, screw-caps, or twist lids that touched floodwater. Only all-metal commercial hermetic cans can be saved after bleach sanitization.
              </p>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/30 space-y-1.5">
              <span className="font-extrabold uppercase text-amber-300 tracking-wider text-[11px]">No Fuel Cooking</span>
              <p className="text-rose-100 leading-relaxed">
                Do not light open stoves if gas leak suspected. Rely entirely on cold-soak Flattened Rice (Aval/Poha), Roasted Bengal Gram (Pottukadalai), sattu, jaggery, and peanuts.
              </p>
            </div>
          </div>

          <div className="pt-1 flex gap-3">
            <Link href="/emergency-food/crisis-mode">
              <Button className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl gap-2">
                Launch Full Crisis Triage Wizard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Core Audit Metrics & Statistics Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              1,379 Master Catalog Disaster Readiness Baseline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated using WHO 2,100 kcal survival threshold and ICMR-NIN emergency guidelines.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            1,379 Foods Audited • 100% Curated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Ready-To-Eat</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.readyToEatCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">Zero cook or wash</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400">Cold-Soakable</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.coldSoakableCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">Aval / Poha, Sattu, Oats</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">Zero Fuel Needed</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.zeroFuelRequiredCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">No stove or gas</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">Zero Water Prep</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.zeroWaterRequiredCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">Protects drinking water</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">Calorie-Dense</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.highCaloricDensityCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">&gt; 300 kcal / 100g</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400">High Spoil Risk</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {auditData ? auditData.metrics.refrigerationDependentCount : '...'}
            </div>
            <p className="text-[11px] text-slate-400">Avoid in blackouts</p>
          </div>
        </div>
      </div>

      {/* 6 Essential Action Hub Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          Interactive Emergency Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: 18 Scenarios */}
          <Link href="/emergency-food/scenarios">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-emerald-600 transition-colors">
                  18 Disaster Scenario Matrix
                </h3>
                <p className="text-xs text-slate-400 font-serif">18 பேரிடர் வகை வழிகாட்டி</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Specific dietary rules and hazards for Floods, Cyclones, Heatwaves, Earthquakes, Blackouts, and Gas Shortages with WHO/NDMA citations.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Explore all 18 Scenarios</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Module 2: Survival Planner */}
          <Link href="/emergency-food/planner">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                  Household Survival Ration Planner
                </h3>
                <p className="text-xs text-slate-400 font-serif">குடும்ப உணவு இருப்பு திட்டமிடல்</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculate 3, 7, 15, or 30-day caloric, protein, and water needs for adults, children, infants, and elderly with ready-to-print checklists.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Calculate Household Rations</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Module 3: Active Crisis Triage */}
          <Link href="/emergency-food/crisis-mode">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-rose-600 transition-colors">
                  Active Crisis Mode &amp; Triage
                </h3>
                <p className="text-xs text-slate-400 font-serif">நிகழ்நேர பேரிடர் உதவி</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                High-contrast emergency dashboard with elapsed blackout timers, floodwater food safety audits, and immediate zero-cook recipes.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Crisis Mode</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Module 4: Food Storage & Preservation */}
          <Link href="/emergency-food/storage">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition-colors">
                  Food Storage &amp; Flood Safety
                </h3>
                <p className="text-xs text-slate-400 font-serif">உணவு சேமிப்பு &amp; பாதுகாப்பு</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Airtight containers, Mylar heat-sealing, rodent protection, monsoon aflatoxin prevention, and floodwater bleach sanitization rules.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Storage &amp; Flood Rules</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Module 5: Water Management */}
          <Link href="/emergency-food/water">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-teal-600 transition-colors">
                  Potable Water &amp; Disinfection
                </h3>
                <p className="text-xs text-slate-400 font-serif">குடிநீர் கணக்கீடு &amp; தூய்மைப்படுத்தல்</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                WHO 3.0L drinking water calculator, cooking water allocations, rolling boil timing, household chlorine bleach disinfection dosage.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                <span>Calculate Potable Water</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Module 6: Pantry Inventory Tracker */}
          <Link href="/emergency-food/inventory">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl w-fit group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-purple-600 transition-colors">
                  Emergency Pantry Tracker
                </h3>
                <p className="text-xs text-slate-400 font-serif">அவசரகால சேமிப்பு கண்காணிப்பு</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your household reserves locally in browser storage with FEFO (First-Expired, First-Out) shelf-life rotation alerts.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Track Household Pantry</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Top 24 Ready-to-Eat Disaster Survival Staples Directory */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Top Zero-Cook Disaster Survival Staples
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-calorie, nutrient-dense foods requiring zero electricity, zero gas, and minimal/zero water.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search food or Tamil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-xs">
              {['ALL', 'Grains', 'Pulses', 'Nuts', 'Natural Sweeteners'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Staples Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStaples.map((food) => (
            <Link key={food.foodId} href={`/food/${food.canonicalSlug}`}>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group shadow-xs hover:shadow-md space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {food.foodNameEnglish}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-serif font-bold">
                      {food.foodNameTamil}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                    {food.primaryClassification.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="text-[11px] font-serif italic text-slate-400 line-clamp-1">
                  {food.scientificName}
                </div>

                {/* Macro Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Calories</span>
                    <div className="font-black text-slate-900 dark:text-white">{food.caloriesPer100g} <span className="text-[10px] text-slate-400 font-normal">kcal</span></div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Protein</span>
                    <div className="font-black text-emerald-600 dark:text-emerald-400">{food.proteinPer100g}g</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Shelf Life: <strong className="text-slate-700 dark:text-slate-300">{food.shelfLifeMonths} Mo</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center">
                    Clinical View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Authoritative Evidence Attribution Footer Bar */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Authoritative Public Health Disaster Evidence Standards
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          All nutritional caloric standards, water requirements, and food spoilage thresholds in this module are drawn strictly from peer-reviewed publications and official directives from the <strong>World Health Organization (WHO)</strong> Sphere Humanitarian Standards, <strong>Federal Emergency Management Agency (FEMA)</strong> Publication P-477, <strong>Centers for Disease Control and Prevention (CDC)</strong> Food Safety in Disaster, <strong>ICMR-National Institute of Nutrition (ICMR-NIN)</strong> Dietary Guidelines for Indians (2024), and <strong>National Disaster Management Authority (NDMA)</strong> India.
        </p>
      </div>
    </div>
  );
}
