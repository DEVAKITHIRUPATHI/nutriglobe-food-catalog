import { ShieldCheck, BookOpen, Sparkles, HelpCircle, FileText, Mail, Building, ShoppingBag } from 'lucide-react';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparency & Quality Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Editorial, AI & Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto">
          Our commitment to scientific accuracy, verified food data, transparent AI usage, and Google Publisher Standards.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8 text-sm">
        {/* Section 1: Editorial Standards */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
            <BookOpen className="w-5 h-5" />
            <h2>1. Editorial Standards & Verified Database Integration</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Every food article and collection published on our platform originates directly from our verified master database of over 100,000 food entities, cultivars, and regional varieties. We strictly prohibit mass auto-generated content designed to manipulate search engine rankings.
          </p>
        </div>

        {/* Section 2: AI Disclosure Policy */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-extrabold text-lg">
            <Sparkles className="w-5 h-5" />
            <h2>2. Transparent AI Assistance Disclosure</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We utilize artificial intelligence (Google Gemini) to assist in topic discovery, initial article drafting, and database cross-referencing. However, all AI-assisted articles undergo automated 17-point quality gate checks (verifying nutrition values, source references, medical safety, and duplicate checks) and human editorial oversight before publication.
          </p>
        </div>

        {/* Section 3: Fact Checking & Medical Safety */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-extrabold text-lg">
            <FileText className="w-5 h-5" />
            <h2>3. Fact-Checking & Medical Claim Guidelines</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our editorial system strictly prohibits unsupported medical claims (e.g. claiming a food cures chronic illness). All health benefits described are expressed in evidence-backed, regulatory-compliant terms (e.g. &quot;contains nutrients that support healthy metabolism&quot;) cross-referenced with national food composition databases (such as ICMR-NIN and FAO INFOODS).
          </p>
        </div>

        {/* Section 4: Publisher & Contact Transparency */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
            <Building className="w-5 h-5" />
            <h2>4. Publisher & Transparency Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
              <span className="font-bold text-gray-900 dark:text-white block">Publisher Entity</span>
              <p>Global Food Knowledge & Nutrition Editorial Platform</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
              <span className="font-bold text-gray-900 dark:text-white block">Editorial Contact</span>
              <p>editorial@foodknowledgeplatform.org</p>
            </div>
          </div>
        </div>

        {/* Section 5: Amazon Associates & Monetization Transparency */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-extrabold text-lg">
            <ShoppingBag className="w-5 h-5" />
            <h2>5. Amazon Associates & Affiliate Monetization Disclosure</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            NutriGlobe participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, NutriGlobe earns from qualifying purchases. Product recommendations for digital kitchen scales, personal blenders, meal prep containers, and nutrition literature are curated to complement our clinical food database.
          </p>

          <AmazonAdBanner format="banner" category="all" maxItems={2} title="Amazon Native Associate Shopping Unit" />
        </div>
      </div>
    </div>
  );
}
