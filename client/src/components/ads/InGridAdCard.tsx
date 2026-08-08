import React from 'react';
import { ShoppingBag, ExternalLink, Sparkles, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InGridAdCard() {
  return (
    <div className="relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-indigo-500/10 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border-2 border-dashed border-amber-400/60 dark:border-amber-500/40 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 justify-between col-span-1">
      {/* Ad Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <Tag className="w-3 h-3" /> Ad Space / Sponsor Deal
        </span>
        <span className="text-[10px] font-mono text-slate-400">AdSense / Amazon Slot</span>
      </div>

      <div className="my-2 space-y-2">
        <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
          <img 
            src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80" 
            alt="Digital Kitchen Scale" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            30% OFF
          </div>
        </div>

        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
          Precision Digital Kitchen Scale for Exact Macro & Calorie Tracking
        </h4>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current mr-0.5" /> 4.8
          </div>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">$13.99</span>
          <span className="line-through text-slate-400 text-xs">$19.99</span>
        </div>
      </div>

      <a 
        href="https://www.amazon.com/dp/B0113GAN44?tag=nutriglobe20-20" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 block"
      >
        <Button className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm gap-1.5 flex items-center justify-center">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>View Sponsor Deal</span>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </a>
    </div>
  );
}
