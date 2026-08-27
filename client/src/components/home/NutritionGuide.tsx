import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'wouter';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function NutritionGuide() {
  const { getLocalizedText } = useTranslation();

  return (
    <section className="mb-12 bg-emerald-50/70 dark:bg-gray-800/90 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-md">
      <div className="md:flex items-center gap-8">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <span className="inline-block bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Nutrition Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            {getLocalizedText('nutrition.understanding')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {getLocalizedText('nutrition.description')}
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white dark:bg-gray-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {getLocalizedText('nutrition.servingSize')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {getLocalizedText('nutrition.servingDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white dark:bg-gray-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {getLocalizedText('nutrition.macronutrients')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {getLocalizedText('nutrition.macronutrientsDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white dark:bg-gray-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {getLocalizedText('nutrition.vitamins')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {getLocalizedText('nutrition.vitaminsDescription')}
                </p>
              </div>
            </div>
          </div>
          <Link href="/nutrition">
            <span className="inline-flex items-center gap-1.5 mt-6 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold text-sm cursor-pointer group">
              <span>{getLocalizedText('nutrition.readGuide')}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1514218985930-e96ab5eead25?auto=format&fit=crop&q=80" 
            alt="Nutrition label example" 
            referrerPolicy="no-referrer"
            className="w-full rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900/40 object-cover"
          />
        </div>
      </div>
    </section>
  );
}

