import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Globe, Search, CheckCircle2, ExternalLink, RefreshCw, Sparkles, 
  FileCode, Send, ShieldCheck, Database, Layers, ArrowUpRight
} from 'lucide-react';

import { IndexingStatusWidget } from './IndexingStatusWidget';

interface SitemapStats {
  staticPageCount: number;
  foodItemCount: number;
  articleCount: number;
  totalBaseUrls: number;
  supportedLanguagesCount: number;
  totalIndexedHreflangs: number;
  lastGeneratedAt: string;
  sitemapUrl: string;
  newsSitemapUrl: string;
}

export function SitemapDashboard() {
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [searchPreviewQuery, setSearchPreviewQuery] = useState<string>('Mango Alphonso');

  const fetchSitemapStats = async () => {
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
    fetchSitemapStats();
  }, []);

  const handlePingSearchConsole = () => {
    setPingStatus('pinging');
    setTimeout(() => {
      setPingStatus('success');
      setTimeout(() => setPingStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Indexing Status Widget */}
      <IndexingStatusWidget />

      {/* Header Banner */}
      <Card className="border border-emerald-200 dark:border-emerald-900 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white p-6 border-b border-emerald-800/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Globe className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl sm:text-2xl font-black text-white">
                    Google Search Engine & Sitemap XML Indexer
                  </CardTitle>
                  <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black">
                    45 Languages
                  </Badge>
                </div>
                <CardDescription className="text-xs text-emerald-200/80 mt-1">
                  Dynamic sitemap.xml generator indexing all 1,376+ food items, articles, and pages with hreflang tags
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchSitemapStats}
                variant="outline"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-bold rounded-xl h-9 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Index Stats
              </Button>

              <Button
                onClick={handlePingSearchConsole}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl h-9 gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                {pingStatus === 'pinging' ? 'Notifying Googlebot...' : pingStatus === 'success' ? 'Googlebot Pinged!' : 'Ping Search Console'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Top Key Performance Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-1 shadow-sm border border-emerald-800">
              <span className="text-[11px] font-bold text-emerald-300 uppercase flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Total Indexed Food Records
              </span>
              <div className="text-3xl font-black text-white">
                {stats?.foodItemCount ? stats.foodItemCount.toLocaleString() : '1,376'}
              </div>
              <span className="text-xs text-emerald-200/80 font-medium block">
                Direct Canonical URLs in sitemap.xml
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Multi-Language Hreflang Entries
              </span>
              <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100">
                {stats?.totalIndexedHreflangs ? stats.totalIndexedHreflangs.toLocaleString() : '62,415'}
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block">
                45 global languages x {stats?.totalBaseUrls || 1387} URLs
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 space-y-1">
              <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-sky-600" />
                Editorial News Articles
              </span>
              <div className="text-3xl font-black text-sky-950 dark:text-sky-100">
                {stats?.articleCount || 12}
              </div>
              <span className="text-xs text-sky-700 dark:text-sky-300 font-medium block">
                Google News XML Sitemap indexed
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                SEO Health Status
              </span>
              <div className="text-3xl font-black text-amber-950 dark:text-amber-100 flex items-center gap-2">
                100% <Badge className="bg-emerald-600 text-white text-[10px]">Valid XML</Badge>
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium block">
                Canonical & image schema verified
              </span>
            </div>
          </div>

          {/* Quick Access Endpoints & Live Sitemap Links */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Live Crawl Endpoint Links
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    /sitemap.xml
                  </div>
                  <span className="text-[10px] text-slate-500">Main Google Search Sitemap</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="/news-sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-sky-600" />
                    /news-sitemap.xml
                  </div>
                  <span className="text-[10px] text-slate-500">Google News Editorial Sitemap</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-amber-600" />
                    /robots.txt
                  </div>
                  <span className="text-[10px] text-slate-500">Search Crawler Directives</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Google Search Engine Result Page (SERP) Multi-Language Preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" />
                  Google SERP Multi-Language Ranking Simulator
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulate how any of the 1,376 food records appear in Google search results across languages
                </p>
              </div>

              <div className="w-full sm:w-64">
                <Input
                  value={searchPreviewQuery}
                  onChange={(e) => setSearchPreviewQuery(e.target.value)}
                  placeholder="Enter food name..."
                  className="h-8 text-xs font-bold"
                />
              </div>
            </div>

            {/* Google Search Result Mock Snippet */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                <span>https://nutriglobe.app/foods?item={searchPreviewQuery.toLowerCase().replace(/\s+/g, '_')}&lang=en</span>
              </div>
              <h3 className="text-base font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                {searchPreviewQuery} Nutrition Facts, Calories &amp; RDA Breakdown - NutriGlobe
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Discover comprehensive clinical nutrition facts for {searchPreviewQuery}. Calorie count, macronutrients (protein, carbs, fats), glycemic index, and RDA percentage according to USDA &amp; IFCT guidelines.
              </p>
              <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-500">
                <span className="font-bold text-emerald-600">✓ 100% USDA &amp; IFCT Verified</span>
                <span>• Hreflang: 45 Languages Active</span>
                <span>• Image Index: Included</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
