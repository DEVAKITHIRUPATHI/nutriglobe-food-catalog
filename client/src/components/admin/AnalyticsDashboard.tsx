import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Eye, Share2, Download, DollarSign, MousePointerClick, 
  TrendingUp, RefreshCw, Search, ShieldAlert, Globe, Radio, Layers, Filter, CheckCircle2, UserCheck,
  BarChart3, LineChart as LineChartIcon, PieChart, ShoppingBag, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { DailyViewsAndAdClicksWidget } from './DailyViewsAndAdClicksWidget';
import { IndexingStatusWidget } from './IndexingStatusWidget';
import type { VisitorAnalyticsSummary } from '@shared/schema';

interface AnalyticsDashboardProps {
  onNavigateToImageQueue?: () => void;
}

export function AnalyticsDashboard({ onNavigateToImageQueue }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<VisitorAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipFilter, setIpFilter] = useState('');
  const [foodFilter, setFoodFilter] = useState('');
  const [onlyRepeatUsers, setOnlyRepeatUsers] = useState(false);
  const [chartMetric, setChartMetric] = useState<'views' | 'ad_views' | 'ad_clicks' | 'revenue'>('views');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="p-8 text-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm text-gray-500 font-medium">Loading Visitor & Analytics Intelligence...</p>
      </div>
    );
  }

  const logs = analytics?.recentVisitorLogs || [];
  const filteredLogs = logs.filter(log => {
    if (onlyRepeatUsers && !log.isRepeatUser) return false;
    if (!ipFilter.trim()) return true;
    const q = ipFilter.toLowerCase();
    return log.ip.toLowerCase().includes(q) ||
           log.country.toLowerCase().includes(q) ||
           log.region.toLowerCase().includes(q) ||
           log.path.toLowerCase().includes(q);
  });

  const foods = analytics?.topFoodMetrics || [];
  const filteredFoods = foods.filter(f => {
    if (!foodFilter.trim()) return true;
    const q = foodFilter.toLowerCase();
    return f.foodName.toLowerCase().includes(q) ||
           f.category.toLowerCase().includes(q) ||
           f.foodId.toLowerCase().includes(q);
  });

  const pages = analytics?.pageMetrics || [];
  const networks = analytics?.networkAdPerformance || [];
  const graphData = analytics?.dailyHistoryGraph || [];

  return (
    <div className="space-y-6">
      {/* Flagged For Review Notice Banner */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-rose-950 dark:text-rose-200">Flagged For Review (2 of 100 Items)</h4>
              <Badge className="bg-rose-600 text-white font-mono text-[10px]">Action Required</Badge>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
              2 food image assets require manual cut/origin verification before approval.
            </p>
          </div>
        </div>
        {onNavigateToImageQueue && (
          <Button
            onClick={onNavigateToImageQueue}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-sm"
          >
            Review Flagged Items (2) <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>

      {/* Top Header & Live Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-950" /> Live Telemetry
            </Badge>
            <h2 className="text-2xl font-black tracking-tight">Visitor Traffic & Performance Analytics</h2>
          </div>
          <p className="text-xs text-emerald-200 mt-1">
            Real-time page views, food-wise engagement, Google/Amazon/Flipkart network ad tracking, and detailed historic graphs.
          </p>
        </div>

        <Button
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          className="bg-emerald-900/80 hover:bg-emerald-800 text-white border-emerald-700 text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-300' : ''}`} /> Sync Analytics
        </Button>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Visitors KPI */}
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Total Site Traffic
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-950 dark:text-emerald-100 flex items-baseline justify-between">
              {analytics?.totalVisits.toLocaleString()}
              <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                {analytics?.uniqueIPsCount} Unique IPs
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>Repeat Users: <strong>{analytics?.repeatUsersCount}</strong></span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              {analytics?.repeatUserPercentage}% Repeat Rate
            </Badge>
          </CardContent>
        </Card>

        {/* Food Engagement KPI */}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Food Views & Daily Counts
            </CardDescription>
            <CardTitle className="text-3xl font-black text-blue-950 dark:text-blue-100">
              {analytics?.totalFoodViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> Shares: <strong>{analytics?.totalShares}</strong></span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> Downloads: <strong>{analytics?.totalDownloads}</strong></span>
          </CardContent>
        </Card>

        {/* Ad Performance KPI */}
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4" /> Ad Views & Clicks
            </CardDescription>
            <CardTitle className="text-3xl font-black text-amber-950 dark:text-amber-100 flex items-baseline justify-between">
              {analytics?.totalAdImpressions.toLocaleString()}
              <span className="text-xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                {analytics?.totalAdClicks} Clicks
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span>Avg CTR: <strong>{analytics?.avgCtr}%</strong></span>
            <Badge className="bg-amber-600 text-white text-[10px] font-bold">
              Google/Amazon/Flipkart
            </Badge>
          </CardContent>
        </Card>

        {/* Ad Revenue KPI */}
        <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Total Ad Monetization
            </CardDescription>
            <CardTitle className="text-3xl font-black text-purple-950 dark:text-purple-100">
              ${analytics?.totalAdRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-purple-800 dark:text-purple-300 flex items-center justify-between">
            <span>Network Earnings</span>
            <Badge className="bg-purple-600 text-white text-[10px] font-bold">
              Active Earnings
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Admin Dashboard Recharts Line Graph Widget for Site Views & Ad Clicks */}
      <DailyViewsAndAdClicksWidget initialData={analytics} />

      {/* Indexing Status & Sitemap Re-index Widget */}
      <IndexingStatusWidget />

      {/* Interactive Historic Graph Section */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-emerald-600" /> Detailed Historic Performance Graph
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                14-day timeline tracking daily page views, food views, Google/Amazon/Flipkart ad views, clicks and revenue.
              </CardDescription>
            </div>

            {/* Graph Metric Toggle Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto text-xs">
              <button
                onClick={() => setChartMetric('views')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'views' 
                    ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Traffic & Food Views
              </button>
              <button
                onClick={() => setChartMetric('ad_views')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'ad_views' 
                    ? 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Ad Views (Google/Amazon/Flipkart)
              </button>
              <button
                onClick={() => setChartMetric('ad_clicks')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'ad_clicks' 
                    ? 'bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Ad Clicks
              </button>
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMetric === 'revenue' 
                    ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Revenue Breakdown ($)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'views' ? (
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFoodViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="pageViews" name="Daily Page Views" stroke="#059669" fillOpacity={1} fill="url(#colorPageViews)" />
                  <Area type="monotone" dataKey="foodViews" name="Daily Food Views" stroke="#2563eb" fillOpacity={1} fill="url(#colorFoodViews)" />
                </AreaChart>
              ) : chartMetric === 'ad_views' ? (
                <BarChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="googleAdViews" name="Google Ad Views" fill="#4285F4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="amazonAdViews" name="Amazon Ad Views" fill="#FF9900" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flipkartAdViews" name="Flipkart Ad Views" fill="#2874F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartMetric === 'ad_clicks' ? (
                <BarChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="googleAdClicks" name="Google Ad Clicks" fill="#ea4335" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="amazonAdClicks" name="Amazon Ad Clicks" fill="#fbbc05" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flipkartAdClicks" name="Flipkart Ad Clicks" fill="#34a853" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotalRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="$" />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="totalRevenue" name="Total Daily Revenue ($)" stroke="#9333ea" fillOpacity={1} fill="url(#colorTotalRev)" />
                  <Area type="monotone" dataKey="googleRevenue" name="Google AdSense ($)" stroke="#4285F4" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="amazonRevenue" name="Amazon Associates ($)" stroke="#FF9900" fill="none" strokeWidth={2} />
                  <Area type="monotone" dataKey="flipkartRevenue" name="Flipkart Affiliate ($)" stroke="#2874F0" fill="none" strokeWidth={2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section: Ad Network Providers Breakdown (Google, Amazon, Flipkart) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" /> Network Ad Views & Ad Clicks (Google, Amazon & Flipkart)
          </h3>
          <Badge variant="outline" className="text-xs">3 Monetization Partners</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {networks.map((net) => {
            const isGoogle = net.provider.includes('Google');
            const isAmazon = net.provider.includes('Amazon');

            return (
              <Card 
                key={net.provider}
                className={`border shadow-sm transition-all ${
                  isGoogle 
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50/20' 
                    : isAmazon 
                    ? 'border-amber-200 dark:border-amber-900 bg-amber-50/20' 
                    : 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/20'
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-extrabold text-gray-900 dark:text-white">
                      {net.provider}
                    </CardTitle>
                    <Badge className={
                      isGoogle ? 'bg-blue-600 text-white' : isAmazon ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                    }>
                      CTR: {net.ctr}%
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-gray-500">
                    Display Ads, Native Cards & Shopping Affiliates
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">Total Ad Views</div>
                      <div className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                        {net.totalImpressions.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        +{net.dailyImpressions.toLocaleString()} today
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">Total Ad Clicks</div>
                      <div className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                        {net.totalClicks.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                        +{net.dailyClicks} clicks today
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <span className="text-gray-500 font-medium">eCPM: <strong>${net.ecpm.toFixed(2)}</strong></span>
                    <span className="font-extrabold text-purple-700 dark:text-purple-300 text-sm">
                      Revenue: ${net.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section: Entire Website Page-Wise Views & Daily Counts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-emerald-600" /> Website Entire Pages-Wise Traffic Counts
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 mt-0.5">
            Page path views breakdown including total views, daily views (today), unique visitors, and average dwell time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Page Name</th>
                    <th className="p-3">Path Route</th>
                    <th className="p-3">Total Views</th>
                    <th className="p-3">Daily Views (Today)</th>
                    <th className="p-3">Unique Visitors</th>
                    <th className="p-3">Avg Time on Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {pages.map((p) => (
                    <tr key={p.path} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="p-3 font-extrabold text-gray-900 dark:text-white text-sm">
                        {p.pageName}
                      </td>
                      <td className="p-3 font-mono text-gray-500 font-medium">
                        {p.path}
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {p.totalViews.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        +{p.dailyViews.toLocaleString()} / day
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-800 dark:text-gray-200">
                        {p.uniqueVisitors.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-gray-500">
                        {p.avgTimeOnPage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Food-Wise Views & Daily Counts Ranking */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-blue-600" /> Food-Wise Total Views & Daily Counts
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                Tracks food item card views, daily view counts, social shares, and PDF export downloads.
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                placeholder="Filter foods..."
                value={foodFilter}
                onChange={(e) => setFoodFilter(e.target.value)}
                className="pl-9 pr-4 text-xs h-8"
              />
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-10 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Rank & Food Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Total Views</th>
                    <th className="p-3">Daily Views (Today)</th>
                    <th className="p-3">Shares Count</th>
                    <th className="p-3">Downloads Count</th>
                    <th className="p-3">Last Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredFoods.map((f, idx) => (
                    <tr key={f.foodId} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="p-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 text-gray-400 font-mono text-center">#{idx + 1}</span>
                        <div>
                          <div className="font-extrabold text-sm text-gray-900 dark:text-white">{f.foodName}</div>
                          <div className="text-[10px] font-mono text-gray-400">{f.foodId}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px] font-medium uppercase">
                          {f.category}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        {f.views.toLocaleString()} views
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{f.dailyViews || Math.round(f.views * 0.08)} / day
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {f.shares} shares
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {f.downloads} downloads
                      </td>
                      <td className="p-3 font-mono text-gray-500 text-[11px]">
                        {new Date(f.lastViewedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: IP-Based Visitors Log */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Globe className="h-5 w-5 text-emerald-600" /> IP-Based Visitor Traffic & Repeated User Highlights
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                Tracks incoming user IP addresses, regional locations, repeat frequency, active page paths, and client signatures.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={onlyRepeatUsers ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOnlyRepeatUsers(!onlyRepeatUsers)}
                className={`text-xs h-8 ${onlyRepeatUsers ? 'bg-emerald-600 text-white' : ''}`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                {onlyRepeatUsers ? 'Showing Repeat Users Only' : 'Filter Repeat Users'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Input
              type="text"
              placeholder="Search by IP, Country, Region or Path..."
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="pl-9 pr-4 text-xs h-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-10 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Region / Location</th>
                    <th className="p-3">Total Visits</th>
                    <th className="p-3">User Highlight</th>
                    <th className="p-3">Active Path</th>
                    <th className="p-3">Last Active Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                        log.isRepeatUser ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {log.ip}
                      </td>
                      <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">
                        {log.country} <span className="text-gray-400 font-normal">({log.region})</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {log.visitCount} visits
                      </td>
                      <td className="p-3">
                        {log.isRepeatUser ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 w-fit shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-200" /> REPEATED VISITOR ({log.visitCount}x)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-gray-500">
                            First-Time Visitor
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-400">
                        {log.path}
                      </td>
                      <td className="p-3 font-mono text-gray-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
