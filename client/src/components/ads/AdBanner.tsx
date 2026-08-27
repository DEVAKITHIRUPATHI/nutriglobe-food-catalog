import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  label?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '1234567890',
  client = 'ca-pub-4353689996620152',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!client || isLoadedRef.current) return;

    // Check if the container has sufficient width before requesting ad rendering
    // Google AdSense requires at least 250px available width for responsive slot sizing
    const tryPushAd = () => {
      if (isLoadedRef.current) return;
      const el = containerRef.current || adRef.current;
      const width = el ? el.offsetWidth || el.parentElement?.offsetWidth || 0 : 0;

      if (width >= 200 && window && (window as any).adsbygoogle) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          isLoadedRef.current = true;
        } catch (e) {
          console.warn('AdSense deferred until container ready:', e);
        }
      }
    };

    // Initial check
    const timer = setTimeout(tryPushAd, 300);

    // Also observe container resize so when width becomes available, push is triggered safely
    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width >= 200) {
            tryPushAd();
            if (isLoadedRef.current && observer) {
              observer.disconnect();
            }
          }
        }
      });
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [client]);

  // If live publisher client key is provided, render live Google AdSense unit
  if (client) {
    return (
      <div ref={containerRef} className={`my-6 mx-auto w-full min-w-[250px] max-w-5xl text-center overflow-hidden ${className}`}>
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
          {label}
        </div>
        <ins
          ref={adRef}
          className="adsbygoogle block w-full min-h-[90px]"
          style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    );
  }

  // Google AdSense Compliant Placeholder Container when Publisher ID is waiting for activation
  return (
    <div className={`my-6 mx-auto w-full max-w-5xl rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black rounded uppercase tracking-wider">
            AdSense Ready Slot
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Google AdSense Responsive Unit ({format}) • Ad ID: <code className="text-slate-700 dark:text-slate-300 font-mono">{slot}</code>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
          <span>Sponsored Notice</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};
