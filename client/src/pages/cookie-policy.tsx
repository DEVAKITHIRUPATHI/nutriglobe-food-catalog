import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, ShieldCheck, CheckCircle2, RotateCcw, Info, Sliders } from 'lucide-react';
import { Link } from 'wouter';

export default function CookiePolicyPage() {
  const [currentConsent, setCurrentConsent] = useState<string>('Not Set');

  useEffect(() => {
    document.title = 'Cookie & Tracking Policy | NutriFacts Transparency';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'NutriFacts Cookie & Storage Policy: Clear information on essential storage, Google AdSense cookies, analytics telemetry, and how to manage your privacy consent preferences.');
    }

    const saved = localStorage.getItem('nutrifacts_cookie_consent') || localStorage.getItem('nutriglobe_cookie_consent');
    if (saved) {
      setCurrentConsent(saved === 'accepted' ? 'All Cookies Accepted' : 'Essential Only');
    }
  }, []);

  const handleResetConsent = () => {
    localStorage.removeItem('nutrifacts_cookie_consent');
    localStorage.removeItem('nutriglobe_cookie_consent');
    setCurrentConsent('Reset (Preferences will prompt on next navigation)');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          <Cookie className="w-3.5 h-3.5" />
          Data Privacy &amp; Consent
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cookie &amp; Local Storage Policy
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          NutriFacts utilizes browser storage and cookies to maintain your clinical calculation units, remember offline food records, and deliver relevant advertisements via Google AdSense.
        </p>
      </div>

      {/* Current User Preferences Card */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your Current Browser Preference
          </div>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 justify-center sm:justify-start">
            <CheckCircle2 className="w-4 h-4" />
            <span>{currentConsent}</span>
          </div>
        </div>
        <Button
          onClick={handleResetConsent}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-700 text-xs rounded-xl gap-2 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Cookie Preferences</span>
        </Button>
      </Card>

      {/* Sections */}
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            1. Strictly Essential Storage (Always Active)
          </h2>
          <p>
            These technologies are necessary for the website to function securely and cannot be switched off:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
            <li><strong>Service Worker Cache (PWA):</strong> Stores static assets, fonts, and core food data offline so the calculator remains functional without an internet connection.</li>
            <li><strong>Calculator Preferences:</strong> Remembers your preferred measurement units (metric kg/cm vs imperial lbs/inches) and chosen language from our 45+ options.</li>
            <li><strong>Security Headers &amp; CSRF Tokens:</strong> Protects against automated scrapers and malicious request forgery.</li>
          </ul>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            2. Google AdSense &amp; Advertising Cookies
          </h2>
          <p>
            Google, as a third-party vendor, uses cookies to serve ads on NutriFacts (https://www.nutrifacts.fun).
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
            <li><strong>Google's DoubleClick Cookie:</strong> Enables Google and its partners to serve ads to users based on their visit to NutriFacts and/or other sites on the Internet.</li>
            <li><strong>Opting Out:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-medium">Google Ads Settings</a> or through the <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-medium">AboutAds.info</a> opt-out portal.</li>
          </ul>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            3. Privacy &amp; Data Protection Compliance
          </h2>
          <p>
            For a complete description of how NutriFacts collects, processes, and protects personal data, please review our comprehensive <Link href="/privacy" className="text-emerald-600 underline font-medium">Privacy Policy</Link>.
          </p>
          <p className="pt-2">
            To submit privacy requests or questions about cookie compliance under GDPR, CCPA, or DPDP Act, contact our compliance officer at <a href="mailto:privacy@nutrifacts.fun" className="text-emerald-600 underline font-medium">privacy@nutrifacts.fun</a>.
          </p>
        </Card>
      </div>
    </div>
  );
}
