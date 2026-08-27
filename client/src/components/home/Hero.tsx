import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { Sparkles, ArrowRight, BookOpen, ShieldCheck, Leaf, Globe2 } from 'lucide-react';

export function Hero() {
  const { getLocalizedText } = useTranslation();

  return (
    <section className="relative rounded-3xl mb-10 overflow-hidden bg-emerald-900 shadow-2xl border-2 border-emerald-700/60 text-white">
      {/* Subtle ambient lighting for depth while maintaining solid contrast */}
      <div 
        aria-hidden="true" 
        className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-700/30 rounded-full blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-800/30 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-14">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm mb-5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Verified Nutrition & Superfoods</span>
          </div>

          {/* Heading */}
          <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            {getLocalizedText('home.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-50 text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed mt-5 max-w-2xl drop-shadow-sm">
            {getLocalizedText('home.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <Link href="/foods" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer active:scale-95 border-2 border-white"
              >
                <span>{getLocalizedText('button.exploreFoods')}</span>
                <ArrowRight className="w-5 h-5 text-emerald-900" />
              </button>
            </Link>

            <Link href="/nutrition" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-950/60 hover:bg-emerald-950/90 text-white border-2 border-emerald-400/80 font-bold text-base sm:text-lg rounded-2xl backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer active:scale-95 hover:border-white"
              >
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span>{getLocalizedText('button.learnMore')}</span>
              </button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-6 border-t border-emerald-800/80 grid grid-cols-3 gap-4 w-full text-xs sm:text-sm font-semibold text-emerald-100">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
              <span>100k+ Foods</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300 shrink-0" />
              <span>Clinical RDA</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
              <span>Multilingual</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Card */}
        <div className="lg:col-span-5 relative w-full">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-600/40 group">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" 
              alt="Fresh healthy superfoods with high nutritional value" 
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Overlaid Badges on Image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 p-3.5 bg-emerald-950/90 backdrop-blur-md rounded-2xl border border-emerald-500/50 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Evidence-Based Macro & Micro Data</span>
              </div>
              <span className="text-emerald-200 font-extrabold bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-600/50">
                USDA & WHO
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

