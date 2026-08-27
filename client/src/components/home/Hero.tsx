import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Sparkles, ArrowRight, BookOpen, ShieldCheck, Leaf, Globe2 } from 'lucide-react';

export function Hero() {
  const { getLocalizedText } = useTranslation();

  return (
    <section className="relative rounded-2xl mb-8 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-2xl border border-emerald-700/50">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold tracking-wide uppercase shadow-sm mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Verified Nutrition & Superfoods</span>
          </div>

          {/* Heading */}
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
            {getLocalizedText('home.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-100 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mt-4 max-w-2xl">
            {getLocalizedText('home.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/foods" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm sm:text-base rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                <span>{getLocalizedText('button.exploreFoods')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/nutrition" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-900/70 hover:bg-emerald-800/90 text-white border-2 border-emerald-400/60 font-bold text-sm sm:text-base rounded-xl backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 hover:border-emerald-300"
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>{getLocalizedText('button.learnMore')}</span>
              </button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 pt-6 border-t border-emerald-800/70 grid grid-cols-3 gap-4 w-full text-xs font-semibold text-emerald-200/90">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100k+ Foods</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Clinical RDA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Multilingual</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Card */}
        <div className="lg:col-span-5 relative w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 group">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" 
              alt="Fresh healthy superfoods with high nutritional value" 
              referrerPolicy="no-referrer"
              className="w-full h-64 sm:h-80 object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Overlaid Badges on Image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 p-3 bg-emerald-950/85 backdrop-blur-md rounded-xl border border-emerald-500/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Evidence-Based Macro & Micro Data</span>
              </div>
              <span className="text-emerald-300 font-extrabold bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                USDA & WHO
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

