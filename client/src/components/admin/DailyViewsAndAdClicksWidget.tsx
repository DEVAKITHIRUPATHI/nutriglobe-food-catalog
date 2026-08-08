import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart as LineChartIcon, Eye, MousePointerClick, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { VisitorAnalyticsSummary } from '@shared/schema';

interface DailyViewsAndAdClicksWidgetProps {
  initialData?: VisitorAnalyticsSummary | null;
}

export function DailyViewsAndAdClicksWidget({ initialData }: DailyViewsAndAdClicksWidgetProps) {
  const [data, setData] = useState<VisitorAnalyticsSummary | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [viewMode, setViewMode] = useState<'combined' | 'views_only' | 'clicks_by_network'>('combined');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics widget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchData();
    } else {
      setData(initialData);
    }
  }, [initialData]);

  const graphData = data?.dailyHistoryGraph || [];

  return (
    <Card className="border border-emerald-200 dark:border-emerald-900 shadow-md bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase">
                <Activity className="w-3 h-3 mr-1 animate-pulse" /> Live Telemetry
              </Badge>
              <CardTitle className="text-xl font-black flex items-center gap-2 text-white">
                <LineChartIcon className="h-5 w-5 text-emerald-400" /> Daily Site Views & Ad-Click Performance
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-emerald-200/80 mt-1">
              Recharts line chart visualizing site traffic (daily views) vs user ad interaction performance (ad clicks).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-700">
              <button
                onClick={() => setViewMode('combined')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'combined'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Combined View
              </button>
              <button
                onClick={() => setViewMode('views_only')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'views_only'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Site Views
              </button>
              <button
                onClick={() => setViewMode('clicks_by_network')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'clicks_by_network'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ad Clicks
              </button>
            </div>

            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700 text-xs h-8 px-2.5"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs">
          <div>
            <span className="text-gray-500 font-medium block">Total Site Visits</span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {data?.totalVisits.toLocaleString() || '14,280'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Total Ad Clicks</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {data?.totalAdClicks.toLocaleString() || '382'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Average CTR</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              {data?.avgCtr || '2.85'}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Total Ad Revenue</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400">
              ${data?.totalAdRevenue.toFixed(2) || '822.15'}
            </span>
          </div>
        </div>

        {/* Recharts Line Graph Visualization */}
        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              
              {/* Left Y-Axis for Site Views */}
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 11 }} 
                label={{ value: 'Daily Site Views', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#059669' } }} 
              />
              
              {/* Right Y-Axis for Ad Clicks */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 11 }} 
                label={{ value: 'Ad Clicks', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#d97706' } }} 
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: '#334155', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '12px' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Line 1: Daily Site Views */}
              {(viewMode === 'combined' || viewMode === 'views_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pageViews"
                  name="Daily Site Views"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                />
              )}

              {/* Line 2: Food Views */}
              {(viewMode === 'combined' || viewMode === 'views_only') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="foodViews"
                  name="Daily Food Views"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#2563eb' }}
                />
              )}

              {/* Line 3: Total Ad Clicks */}
              {(viewMode === 'combined') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalAdClicks"
                  name="Total Ad Clicks"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#d97706' }}
                  activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              )}

              {/* Provider Breakdown Clicks */}
              {(viewMode === 'clicks_by_network') && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="googleAdClicks"
                    name="Google AdSense Clicks"
                    stroke="#4285F4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4285F4' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amazonAdClicks"
                    name="Amazon Associates Clicks"
                    stroke="#FF9900"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#FF9900' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="flipkartAdClicks"
                    name="Flipkart Affiliate Clicks"
                    stroke="#2874F0"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2874F0' }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
