import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Google AdSense & GDPR Compliant Policy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy & Data Rights
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Effective Date: July 30, 2026. NutriGlobe is committed to protecting your personal information and complying with GDPR, CCPA, and Google AdSense partner policy regulations.
        </p>
      </div>

      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Section 1: Overview */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            1. Information We Collect
          </h2>
          <p>
            NutriGlobe respects user privacy. We do not require account registration to view food nutrition facts, calculate BMR/TDEE, or read health articles.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <li><strong>Non-Personal Technical Logs:</strong> IP address, browser user-agent, language preferences, and device type for diagnostic performance monitoring.</li>
            <li><strong>Local State Storage:</strong> Meal plan selections and customized RDA calculator parameters saved locally on your browser.</li>
            <li><strong>Third-Party Analytics:</strong> Aggregated, anonymized traffic measurements via Google Analytics to optimize page load speeds.</li>
          </ul>
        </Card>

        {/* Section 2: Google AdSense & Cookies */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            2. Google AdSense & Third-Party Advertising Cookies
          </h2>
          <p>
            NutriGlobe displays third-party advertisements served by Google AdSense and its authorized advertising partners.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs sm:text-sm">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Important Notices regarding Google DART Cookie:
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              • Google, as a third-party vendor, uses cookies to serve ads on NutriGlobe.<br />
              • Google's use of advertising cookies enables it and its partners to serve ads based on your visit to NutriGlobe and/or other sites on the Internet.<br />
              • Users may opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Google Ads Settings</a>.
            </p>
          </div>
        </Card>

        {/* Section 3: GDPR & CCPA Rights */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            3. Your GDPR & CCPA Data Rights
          </h2>
          <p>
            Depending on your location, you hold statutory rights regarding your digital data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
              <strong className="text-emerald-900 dark:text-emerald-200 block mb-1">Right to Access & Portability</strong>
              You may request a copy of any personal data stored or submitted to NutriGlobe.
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
              <strong className="text-emerald-900 dark:text-emerald-200 block mb-1">Right to Deletion & Erasure</strong>
              You may request the immediate wiping of any local or server storage logs associated with your IP or query history.
            </div>
          </div>
        </Card>

        {/* Section 4: Contact Information */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            4. Privacy Inquiries & Data Protection Officer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            For privacy inquiries, cookie consent resets, or data requests, please contact our privacy compliance desk at <a href="mailto:privacy@nutriglobe.app" className="text-emerald-600 underline font-semibold">privacy@nutriglobe.app</a> or submit a message via our <a href="/contact" className="text-emerald-600 underline font-semibold">Contact Page</a>.
          </p>
        </Card>
      </div>
    </div>
  );
}
