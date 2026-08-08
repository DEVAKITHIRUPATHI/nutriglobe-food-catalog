import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, Sparkles, RefreshCw, CheckCircle2, Clock, 
  FileCode, Send, Database, Layers, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface SitemapStats {
  staticPageCount: number;
  foodItemCount: number;
  articleCount: number;
  totalBaseUrls: number;
  supportedLanguagesCount: number;
  totalIndexedHreflangs: number;
  lastGeneratedAt: string;
  lastReindexedAt?: string;
  sitemapUrl: string;
  newsSitemapUrl: string;
}

export function IndexingStatusWidget() {
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [reindexSuccess, setReindexSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/sitemap-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch sitemap stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerReindex = async () => {
    setReindexing(true);
    setReindexSuccess(null);
    try {
      const res = await fetch('/api/seo/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        const formattedTime = new Date(data.reindexedAt || Date.now()).toLocaleTimeString();
        setReindexSuccess(`Re-index complete at ${formattedTime}! ${data.stats?.totalBaseUrls || 0} base URLs & ${data.stats?.totalIndexedHreflangs?.toLocaleString() || 0} hreflangs generated.`);
        setTimeout(() => setReindexSuccess(null), 8000);
      }
    } catch (e) {
      console.error('Failed to reindex sitemaps:', e);
    } finally {
      setReindexing(false);
    }
  };

  const formatTimestamp = (isoStr?: string) => {
    if (!isoStr) return 'Not available';
    try {
      const date = new Date(isoStr);
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <Card className="border border-teal-200 dark:border-teal-900 shadow-md bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                  Google Indexing &amp; Dynamic Sitemap Status
                </CardTitle>
                <Badge className="bg-teal-400 text-slate-950 font-bold text-[10px] uppercase">
                  Live Indexer
                </Badge>
              </div>
              <CardDescription className="text-xs text-teal-200/80 mt-0.5">
                Dynamic XML Sitemap &amp; Hreflang indexer for all food records, blog articles, and pages.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleTriggerReindex}
              disabled={reindexing}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl h-9 px-4 gap-2 shadow-md transition-all transform active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
              {reindexing ? 'Rebuilding Sitemap XML...' : 'Trigger Re-index'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Success Alert Banner */}
        {reindexSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{reindexSuccess}</span>
          </div>
        )}

        {/* Timestamp & Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Last Generated Timestamp */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Last Generated
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
              {formatTimestamp(stats?.lastGeneratedAt || stats?.lastReindexedAt)}
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
              Auto-syncs on content updates
            </div>
          </div>

          {/* Total Food Records Indexed */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Food Items Indexed
            </div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {stats?.foodItemCount?.toLocaleString() || 0} Foods
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              + {stats?.articleCount || 0} Articles &amp; {stats?.staticPageCount || 9} Pages
            </div>
          </div>

          {/* Total Base URLs */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase">
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Total Base URLs
            </div>
            <div className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1">
              {stats?.totalBaseUrls?.toLocaleString() || 0} URLs
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
              In sitemap.xml
            </div>
          </div>

          {/* Multi-Language Hreflang Tags */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 uppercase">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Indexed Hreflangs
            </div>
            <div className="text-lg font-black text-purple-700 dark:text-purple-400 mt-1">
              {stats?.totalIndexedHreflangs?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 font-medium">
              45 Supported Languages
            </div>
          </div>
        </div>

        {/* Direct Links to Live XML Endpoints */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div className="flex items-center gap-4">
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" /> /sitemap.xml <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="/news-sitemap.xml" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" /> /news-sitemap.xml <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="/robots.txt" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> /robots.txt <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Optimized for Googlebot &amp; Search Console
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
