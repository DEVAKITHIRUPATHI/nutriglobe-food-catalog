import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nutriglobe_cookie_consent');
    if (!consent) {
      // Delay showing banner slightly for smooth page entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nutriglobe_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('nutriglobe_cookie_consent', 'necessary_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-700 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <Cookie className="w-4 h-4 text-emerald-400" />
            <span>Privacy & Cookie Preferences</span>
          </div>
          <button 
            onClick={handleDecline}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We and our partners (including Google AdSense) use cookies and anonymous identifiers to personalize advertisements, analyze traffic, and improve WHO nutrition calculations.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <Button 
            onClick={handleAccept} 
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex-1 rounded-xl shadow-md"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept All
          </Button>
          <Button 
            onClick={handleDecline} 
            variant="outline" 
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs rounded-xl"
          >
            Essential Only
          </Button>
          <a 
            href="/privacy" 
            className="text-[11px] text-emerald-400 underline hover:text-emerald-300 ml-1 whitespace-nowrap"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};
