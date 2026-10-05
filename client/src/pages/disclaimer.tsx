import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Stethoscope, ShieldCheck, HeartPulse, FileText, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'wouter';

export default function MedicalDisclaimerPage() {
  useEffect(() => {
    document.title = 'Medical & Nutrition Disclaimer | NutriFacts Clinical Reference';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'NutriFacts Medical & Nutrition Disclaimer: Educational food and macronutrient calculations reference WHO, USDA, and ICMR datasets and do not constitute individual medical advice.');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          Health & Medical Disclosure
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Medical & Nutrition Information Disclaimer
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          NutriFacts provides open-access nutritional calculations, micronutrient breakdowns, and botanical profiles compiled from international food composition tables for educational purposes only.
        </p>
      </div>

      {/* Main Notice Callout */}
      <Card className="p-6 bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-base">
          <Stethoscope className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Not a Substitute for Professional Medical Advice</span>
        </div>
        <p className="text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
          The content on <strong>NutriFacts</strong> (https://www.nutrifacts.fun), including text, graphics, calorie numbers, RDA percentages, bio-active constituent estimates, and organ-support summaries, is provided for general informational and educational purposes only. It is <strong>not intended to be a substitute for professional medical advice, clinical diagnosis, or medical treatment</strong>.
        </p>
      </Card>

      {/* Sections */}
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            1. Scientific Dataset Sources & Natural Variance
          </h2>
          <p>
            NutriFacts harmonizes reference data from peer-reviewed institutional food composition tables, including:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
            <li><strong>WHO / FAO</strong>: World Health Organization Recommended Nutrient Intakes &amp; Guidelines</li>
            <li><strong>USDA FoodData Central</strong>: Standard Reference (SR Legacy) &amp; Foundation Foods</li>
            <li><strong>ICMR-NIN (IFCT)</strong>: Indian Food Composition Tables (National Institute of Nutrition)</li>
            <li><strong>Peer-reviewed Botanical &amp; Agricultural Literature</strong> for cultivar taxonomy</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            Agricultural produce naturally varies in macro- and micronutrient concentrations depending on soil composition, cultivation climate, harvest timing, ripeness, storage duration, and culinary preparation methods. Values listed are authoritative population averages, not exact laboratory assays of any specific commercial batch.
          </p>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            2. Medical Conditions, Allergies &amp; Prescription Medications
          </h2>
          <p>
            Always seek the advice of your physician, registered dietitian, or other qualified healthcare provider with any questions you may have regarding a medical condition, chronic illness, pregnancy, pediatric feeding, or dietary adjustments.
          </p>
          <p>
            <strong>Drug-Nutrient Interactions:</strong> Certain whole foods and herbs contain active phytochemicals that may interact with prescription pharmaceuticals (for example, high vitamin K foods with anticoagulants, grapefruit with cytochrome P450 substrates, or high potassium foods with ACE inhibitors). Never discontinue or alter prescribed medical therapies based on information read on NutriFacts.
          </p>
          <p>
            <strong>Food Allergies:</strong> If you suspect or have known IgE-mediated food allergies, celiac disease, or specific food intolerances, verify allergen status directly with food producers and consult an allergist.
          </p>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            3. Evidence-Aware Phrasing Standards
          </h2>
          <p>
            In accordance with our <Link href="/editorial-policy" className="text-emerald-600 underline font-medium">Editorial Policy</Link>, NutriFacts adheres to responsible scientific communication:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
            <li>We do not claim that any single whole food or nutrient "cures", "treats", or "replaces medical therapies" for pathological diseases.</li>
            <li>Functional health properties are described using evidence-aware language such as <em>"contributes to normal energy metabolism"</em>, <em>"contains antioxidants associated with cellular protection"</em>, or <em>"supports normal immune function"</em> as recognized by global health authorities.</li>
          </ul>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            4. Contacting the Clinical Editorial Board
          </h2>
          <p>
            If you represent a clinical research body, university laboratory, or hospital dietetics department and wish to submit corrections, reference citations, or verified laboratory assays, please reach out to our team at <a href="mailto:editor@nutrifacts.fun" className="text-emerald-600 underline font-medium">editor@nutrifacts.fun</a> or via our <Link href="/contact" className="text-emerald-600 underline font-medium">Contact Desk</Link>.
          </p>
        </Card>
      </div>
    </div>
  );
}
