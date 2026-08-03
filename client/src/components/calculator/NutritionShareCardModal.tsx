import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Download, Share2, Sparkles, Dumbbell, Heart, Flame, Scale, Check, 
  Droplets, ShieldCheck, Palette, Copy, CheckCircle2, Stethoscope, Apple,
  Quote, User, Edit3, MessageSquareQuote, Globe, RefreshCw
} from 'lucide-react';

interface NutritionShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    age: number;
    sex: string;
    weightKg: number;
    heightCm: number;
    goal: string;
    activity: string;
  };
  calculations: {
    bmi: string;
    bmiCategory: string;
    bmiColor: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    proteinGrams: number;
    proteinCal: number;
    carbGrams: number;
    carbCal: number;
    fatGrams: number;
    fatCal: number;
    waterLiters: string;
  };
  rda: {
    fiber: string;
    calcium: string;
    iron: string;
    vitaminD: string;
    folate: string;
    sodium: string;
    potassium: string;
    vitaminC: string;
  };
}

const THEMES = [
  { id: 'emerald', name: 'Emerald Clinical', bg: 'from-slate-900 via-emerald-950 to-slate-950', accent: '#10b981', border: 'border-emerald-500/30' },
  { id: 'indigo', name: 'Midnight Indigo', bg: 'from-slate-950 via-indigo-950 to-slate-900', accent: '#6366f1', border: 'border-indigo-500/30' },
  { id: 'sunset', name: 'Sunset Amber', bg: 'from-slate-950 via-amber-950 to-slate-900', accent: '#f59e0b', border: 'border-amber-500/30' },
  { id: 'rose', name: 'Vital Rose', bg: 'from-slate-950 via-rose-950 to-slate-900', accent: '#f43f5e', border: 'border-rose-500/30' },
];

const PRESET_GREETINGS = [
  "Nourishing my body with WHO-standard clinical targets today! 🥗✨",
  "Fueling my daily progress with precision macronutrients! 💪🔥",
  "Consistency is key! Here is my daily nutrition breakdown 🌿🍏",
  "Crushing my fitness and health goals with NutriGlobe! 🚀🎯"
];

export const NutritionShareCardModal: React.FC<NutritionShareCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  calculations,
  rda
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable User Customizations
  const [userName, setUserName] = useState('Devaki');
  const [userGreeting, setUserGreeting] = useState('Nourishing my body with WHO-standard clinical targets today! 🥗✨');
  const [appBrandingName, setAppBrandingName] = useState('NutriGlobe™ Clinical Nutrition');
  const [showCustomizer, setShowCustomizer] = useState(true);

  const goalLabels: Record<string, string> = {
    lose: 'Fat Loss & Cutting',
    maintain: 'Weight Maintenance',
    gain: 'Muscle Building & Bulk',
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High DPI export
      });
      const link = document.createElement('a');
      const safeName = (userName || 'User').replace(/[^a-zA-Z0-0]/g, '-');
      link.download = `NutriGlobe-ShareCard-${safeName}-${calculations.targetCalories}kcal.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = () => {
    const text = `💬 "${userGreeting}" — ${userName || 'A NutriGlobe User'}\n\n🥗 My Daily NutriGlobe Nutrition Targets:\n🔥 Target Calories: ${calculations.targetCalories} kcal\n💪 Protein: ${calculations.proteinGrams}g (${calculations.proteinCal} kcal)\n🌾 Carbs: ${calculations.carbGrams}g (${calculations.carbCal} kcal)\n🥑 Fats: ${calculations.fatGrams}g (${Math.round(calculations.fatCal)} kcal)\n💧 Hydration Target: ${calculations.waterLiters}L/day\n📊 BMI Status: ${calculations.bmiCategory} (${calculations.bmi})\n\nCalculated via ${appBrandingName}: https://nutriglobe.app/calculator`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-white rounded-3xl p-6 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Social Share Card Generator</span>
            </DialogTitle>
            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-full border border-slate-800">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t)}
                  className={`w-5 h-5 rounded-full transition-transform ${activeTheme.id === t.id ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: t.accent }}
                  title={t.name}
                />
              ))}
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Customize your name, personal greeting quote, and branding details before generating your shareable image.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* User Input Customizer Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Customize Sender & Quoted Greeting
              </span>
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                {showCustomizer ? 'Hide Controls' : 'Edit Text'}
              </button>
            </div>

            {showCustomizer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <User className="w-3 h-3 text-emerald-400" />
                    Your Name / Handle
                  </Label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Devaki or Coach Sarah"
                    className="bg-slate-950 border-slate-700 text-xs text-white rounded-xl h-9"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    Application Branding Name
                  </Label>
                  <Input
                    value={appBrandingName}
                    onChange={(e) => setAppBrandingName(e.target.value)}
                    placeholder="Application Name"
                    className="bg-slate-950 border-slate-700 text-xs text-white rounded-xl h-9"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                    <MessageSquareQuote className="w-3 h-3 text-emerald-400" />
                    Custom Quoted Greeting / Message to Share
                  </Label>
                  <Textarea
                    value={userGreeting}
                    onChange={(e) => setUserGreeting(e.target.value)}
                    placeholder="Write a message or motivation note..."
                    rows={2}
                    className="bg-slate-950 border-slate-700 text-xs text-white rounded-xl resize-none"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_GREETINGS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserGreeting(preset)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-colors"
                      >
                        "{preset.substring(0, 28)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* THE CARD TO EXPORT */}
          <div
            ref={cardRef}
            className={`bg-gradient-to-br ${activeTheme.bg} p-6 sm:p-8 rounded-3xl border ${activeTheme.border} shadow-2xl space-y-6 text-white relative overflow-hidden`}
          >
            {/* Background Glow Accents */}
            <div 
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeTheme.accent }}
            />
            <div 
              className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeTheme.accent }}
            />

            {/* Header: App Branding Name & Logo */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 text-xl font-black">
                    🌿
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    {appBrandingName}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                      Verified
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">WHO Clinical RDA & Macro Report • {currentDate}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Target Goal</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full inline-block">
                  {goalLabels[profile.goal] || 'Health Maintenance'}
                </span>
              </div>
            </div>

            {/* Custom Quoted Greeting Banner */}
            {userGreeting && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 relative z-10 shadow-lg space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <Quote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm italic font-medium text-emerald-100 leading-relaxed">
                      "{userGreeting}"
                    </p>
                    <p className="text-[11px] font-bold text-emerald-300 text-right">
                      — Shared by <span className="text-white underline underline-offset-2">{userName || 'Health Explorer'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Highlight: Calories & Biometrics */}
            <div className="grid grid-cols-12 gap-4 relative z-10">
              {/* Target Calories Hero Card */}
              <div className="col-span-12 sm:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Target Energy Intakes
                  </span>
                  <span className="text-[10px] text-slate-400">WHO Standard</span>
                </div>

                <div className="py-2">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
                    {calculations.targetCalories}
                    <span className="text-sm font-extrabold text-emerald-400">kcal / day</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
                  <span>BMR: <strong>{calculations.bmr} kcal</strong></span>
                  <span>TDEE: <strong>{calculations.tdee} kcal</strong></span>
                </div>
              </div>

              {/* Profile & BMI Card */}
              <div className="col-span-12 sm:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Biometric Profile
                  </span>
                  <div className="text-xs text-slate-200 font-medium space-y-0.5">
                    <p>{profile.age} Yrs • {profile.sex === 'male' ? 'Male' : 'Female'} • {profile.weightKg} kg</p>
                    <p className="text-slate-400">Height: {profile.heightCm} cm</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">BMI Index</span>
                  <Badge className={`text-xs font-bold ${calculations.bmiColor}`}>
                    {calculations.bmi} ({calculations.bmiCategory})
                  </Badge>
                </div>
              </div>
            </div>

            {/* Macronutrients Grid */}
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
                Target Macronutrient Ratio
              </span>
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-rose-300 block">Protein</span>
                  <div className="text-xl font-black text-rose-100">{calculations.proteinGrams}g</div>
                  <span className="text-[10px] text-rose-300/80 block">{calculations.proteinCal} kcal</span>
                </div>

                {/* Carbohydrates */}
                <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">Carbs</span>
                  <div className="text-xl font-black text-amber-100">{calculations.carbGrams}g</div>
                  <span className="text-[10px] text-amber-300/80 block">{calculations.carbCal} kcal</span>
                </div>

                {/* Fats */}
                <div className="bg-sky-950/40 border border-sky-500/30 p-3 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-sky-300 block">Fats</span>
                  <div className="text-xl font-black text-sky-100">{calculations.fatGrams}g</div>
                  <span className="text-[10px] text-sky-300/80 block">{Math.round(calculations.fatCal)} kcal</span>
                </div>
              </div>
            </div>

            {/* Micronutrients & Hydration Banner */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  Hydration Target: {calculations.waterLiters} Liters / Day
                </span>
                <span className="text-[10px] text-slate-400">Clinical Micronutrients</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Dietary Fiber</span>
                  <strong className="text-white">{rda.fiber}</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Calcium</span>
                  <strong className="text-white">{rda.calcium}</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Elemental Iron</span>
                  <strong className="text-white">{rda.iron}</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Vitamin D3</span>
                  <strong className="text-white">{rda.vitaminD}</strong>
                </div>
              </div>
            </div>

            {/* Footer Branding Watermark */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10 relative z-10">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{appBrandingName}</span> • Verified by WHO Guidelines
              </span>
              <span className="font-mono text-emerald-300/90 font-black tracking-wider">
                🌿 nutriglobe.app
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            onClick={handleCopySummary}
            variant="outline"
            className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold rounded-xl gap-2"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Text Summary'}</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-slate-400 hover:text-white text-xs font-bold rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl px-5 py-2.5 shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Image...' : 'Save Image (PNG)'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

