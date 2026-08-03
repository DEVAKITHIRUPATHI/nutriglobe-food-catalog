import React from 'react';
import { FileCheck, Stethoscope, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <FileCheck className="w-3.5 h-3.5" />
          Legal Agreement & Terms of Service
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service & Medical Disclaimer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Effective Date: July 30, 2026. Please read these Terms of Service carefully before using the NutriGlobe platform, RDA calculators, or clinical nutrition guides.
        </p>
      </div>

      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Medical Disclaimer Alert Box */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-5 rounded-2xl flex items-start gap-3 shadow-sm">
          <Stethoscope className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <strong className="font-extrabold uppercase tracking-wide block">
              Medical & Nutritional Disclaimer (Important Notice)
            </strong>
            <p>
              The content, RDA calculations, BMR/TDEE estimators, and food data provided on NutriGlobe are strictly for educational and informational purposes. They do NOT constitute professional medical advice, diagnosis, or treatment. Always consult a qualified physician or registered dietitian before making significant changes to your diet or medical treatment plan.
            </p>
          </div>
        </div>

        {/* Section 1: Use of Service */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            1. Terms of Use & Intellectual Property
          </h2>
          <p>
            By accessing NutriGlobe, you agree to utilize the platform in compliance with all applicable local and international laws. All software code, database compilations, translations, and editorial articles are protected by copyright laws.
          </p>
        </Card>

        {/* Section 2: Data Accuracy & Sources */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            2. Data Sources & Accuracy Disclaimer
          </h2>
          <p>
            NutriGlobe references clinical nutrition databases provided by the World Health Organization (WHO), USDA FoodData Central, ICMR National Institute of Nutrition, and peer-reviewed journals. While we endeavor to maintain maximum data accuracy, natural variance occurs in raw food produce and culinary preparation.
          </p>
        </Card>

        {/* Section 3: Limitation of Liability */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emerald-600" />
            3. Limitation of Liability
          </h2>
          <p>
            In no event shall NutriGlobe, its clinical editors, developers, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our platform or reliance on food nutrition calculations.
          </p>
        </Card>
      </div>
    </div>
  );
}
