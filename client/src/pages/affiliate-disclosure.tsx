import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ShoppingBag, ShieldCheck, DollarSign, ExternalLink, Info, CheckCircle2, HeartHandshake } from 'lucide-react';
import { Link } from 'wouter';

export default function AffiliateDisclosurePage() {
  useEffect(() => {
    document.title = 'Affiliate & Advertising Disclosure | NutriFacts Transparency';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'NutriFacts Affiliate & Advertising Disclosure: Full transparency on partner programs (Amazon Associates, Flipkart), sponsored placements, and Google AdSense monetization.');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5" />
          Monetization &amp; FTC Transparency
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Affiliate &amp; Advertising Disclosure
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          NutriFacts is committed to full editorial independence, scientific objectivity, and transparent monetization in compliance with FTC guidelines and Google Publisher Policies.
        </p>
      </div>

      {/* Main Principles Card */}
      <Card className="p-6 bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-extrabold text-base">
          <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Our Editorial Independence Guarantee</span>
        </div>
        <p className="text-sm text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
          <strong>NutriFacts does not accept payment to alter nutritional data, USDA/WHO calculations, or clinical macro breakdowns.</strong> Our primary mission is providing free, high-precision food nutrition facts to global users in 45+ languages. Monetization exists solely to support server hosting, database maintenance, and scientific research.
        </p>
      </Card>

      {/* Structured Sections */}
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            1. Amazon Services LLC Associates Program
          </h2>
          <p>
            NutriFacts (https://www.nutrifacts.fun) is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated international marketplaces.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>As an Amazon Associate, NutriFacts earns from qualifying purchases.</strong> When you click on an Amazon partner link displayed on a food cultivar page (for example, to purchase organic chia seeds, cold-pressed coconut oil, or unpolished millets) and complete a purchase, we may receive a small commission at no additional cost to you.
          </p>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            2. Flipkart Affiliate Program &amp; Regional Retail Partners
          </h2>
          <p>
            For regional cultivars, traditional Indian grains (e.g. Karuppu Kavuni, Kodo Millet), and herbal superfoods, NutriFacts participates in the Flipkart Affiliate Program and trusted direct agricultural cooperatives.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All outbound commercial partner links carry <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">rel="sponsored nofollow"</code> attributes in compliance with Google Webmaster and Search Essentials guidelines.
          </p>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            3. Google AdSense &amp; Third-Party Display Advertising
          </h2>
          <p>
            NutriFacts displays banner and in-article advertisements served by Google AdSense and authorized ad exchanges.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
            <li><strong>Clear Labeling:</strong> Display advertisements are explicitly labeled as <em>"Advertisement"</em> or <em>"Sponsored"</em>.</li>
            <li><strong>No Deceptive Placement:</strong> Ads are positioned outside core navigation, away from interactive calculation buttons, and never disguised as food cards.</li>
            <li><strong>No Ads on Private or Thin Routes:</strong> In accordance with Google Publisher Policies, advertisements are disabled on 404 error pages, private intake tracking dashboards, login pages, and empty search results.</li>
          </ul>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            4. User Pricing Impact
          </h2>
          <p>
            Clicking an affiliate or partner link does <strong>never increase the price you pay</strong> for any product. In many cases, verified agricultural partner coupons negotiated for NutriFacts readers provide exclusive discounts.
          </p>
          <p className="pt-2">
            Questions regarding our monetization policies or commercial partnerships may be submitted via our <Link href="/contact" className="text-emerald-600 underline font-medium">Contact Desk</Link> or by emailing <a href="mailto:editor@nutrifacts.fun" className="text-emerald-600 underline font-medium">editor@nutrifacts.fun</a>.
          </p>
        </Card>
      </div>
    </div>
  );
}
