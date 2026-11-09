import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Compass, ShieldCheck, Droplets, Flame, AlertTriangle, 
  Search, ArrowLeft, ExternalLink, ChevronRight, CheckCircle2,
  Filter, Wind, Waves, Sun, Snowflake, Zap, Truck, DollarSign, Home
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DisasterScenario {
  id: string;
  nameEnglish: string;
  nameTamil: string;
  category: string;
  primaryHazards: string[];
  keyFoodStrategies: string[];
  waterRule: string;
  fuelRule: string;
  authoritativeSource: string;
}

export default function EmergencyScenariosPage() {
  const [scenarios, setScenarios] = useState<DisasterScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetch('/api/emergency-food/scenarios')
      .then(res => res.json())
      .then(data => {
        setScenarios(data.scenarios || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load scenarios:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['ALL', 'Hydrological', 'Meteorological', 'Infrastructure', 'Geophysical', 'Climatological', 'Supply & Fuel', 'Humanitarian'];

  const filteredScenarios = scenarios.filter(s => {
    const matchesSearch = 
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameTamil.includes(searchQuery) ||
      s.keyFoodStrategies.some(strat => strat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.primaryHazards.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'ALL') return matchesSearch;
    return matchesSearch && s.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const getScenarioIcon = (id: string) => {
    if (id.includes('flood') || id.includes('tsunami') || id.includes('water')) return <Waves className="w-5 h-5 text-blue-500" />;
    if (id.includes('cyclone') || id.includes('wind')) return <Wind className="w-5 h-5 text-teal-500" />;
    if (id.includes('heat') || id.includes('drought') || id.includes('fire')) return <Sun className="w-5 h-5 text-amber-500" />;
    if (id.includes('cold')) return <Snowflake className="w-5 h-5 text-sky-400" />;
    if (id.includes('blackout') || id.includes('power')) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (id.includes('fuel')) return <Flame className="w-5 h-5 text-rose-500" />;
    if (id.includes('supply') || id.includes('inflation')) return <DollarSign className="w-5 h-5 text-emerald-500" />;
    return <AlertTriangle className="w-5 h-5 text-rose-500" />;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/emergency-food" className="hover:text-emerald-600 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Emergency Hub</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">18 Disaster Scenarios</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Comprehensive Disaster Response Protocols</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          18 Disaster Scenarios &amp; Survival Nutrition Rules
        </h1>
        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-serif">
          18 பேரிடர் வகைகள் மற்றும் அவசரகால உணவு வழிகாட்டு நெறிமுறைகள்
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Each disaster presents distinct infrastructural constraints. In a flood, water is the primary poison; in a blackout, refrigeration failure causes bacterial blooms within 4 hours; in an earthquake, ruptured gas lines make open flames deadly.
        </p>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search scenario, flood, cyclone, blackout, gas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-white dark:bg-slate-900"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs hover:shadow-md space-y-4"
          >
            {/* Title & Category Bar */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  {getScenarioIcon(scenario.id)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {scenario.nameEnglish}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-serif font-bold">
                    {scenario.nameTamil}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800">
                {scenario.category}
              </Badge>
            </div>

            {/* Primary Hazards */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Primary Hazards &amp; Vulnerabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scenario.primaryHazards.map((hazard, hIdx) => (
                  <span
                    key={hIdx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40"
                  >
                    {hazard}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Food Strategies */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mandatory Food Strategy
              </span>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {scenario.keyFoodStrategies.map((strat, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{strat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Water & Fuel Specific Directive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
                <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1 text-[11px] uppercase">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  Potable Water Rule
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-tight">
                  {scenario.waterRule}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1 text-[11px] uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Cooking Fuel Protocol
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-tight">
                  {scenario.fuelRule}
                </p>
              </div>
            </div>

            {/* Authoritative Citation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standard: <strong>{scenario.authoritativeSource}</strong></span>
              </span>

              <Link href={`/emergency-food/planner?scenario=${scenario.id}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center">
                <span>Plan Rations</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
