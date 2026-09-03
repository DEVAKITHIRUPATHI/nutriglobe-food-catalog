import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  History, Search, Trash2, ArrowUpRight, Clock, Tag, 
  BarChart2, RotateCcw, Sparkles 
} from 'lucide-react';
import type { SearchHistoryItem } from '@/lib/idb';

interface HistoricalSearchDataProps {
  searchHistory: SearchHistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoricalSearchData({
  searchHistory,
  onRemoveItem,
  onClearHistory
}: HistoricalSearchDataProps) {
  const [, navigate] = useLocation();
  const [filterQuery, setFilterQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Friendly relative time formatter
  const formatTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Re-run search by navigating to foods page with query
  const handleReRunSearch = (query: string, category?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    navigate(`/foods?${params.toString()}`);
  };

  // Extract top frequent keywords
  const topKeywords = useMemo(() => {
    const frequency: Record<string, number> = {};
    searchHistory.forEach(item => {
      if (item.query && item.query.trim()) {
        const term = item.query.trim();
        frequency[term] = (frequency[term] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([term, count]) => ({ term, count }));
  }, [searchHistory]);

  // Extract category frequencies
  const categoryStats = useMemo(() => {
    const cats: Record<string, number> = {};
    searchHistory.forEach(item => {
      const c = item.category || 'all';
      cats[c] = (cats[c] || 0) + 1;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [searchHistory]);

  // Filtered search list
  const filteredHistory = useMemo(() => {
    if (!filterQuery.trim()) return searchHistory;
    const q = filterQuery.toLowerCase().trim();
    return searchHistory.filter(item => 
      item.query.toLowerCase().includes(q) || 
      (item.category && item.category.toLowerCase().includes(q))
    );
  }, [searchHistory, filterQuery]);

  if (searchHistory.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <CardContent className="p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 mx-auto flex items-center justify-center">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Search History Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your searches across food items and categories are automatically stored locally in your browser storage.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/foods')} 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs"
          >
            <Search className="w-4 h-4" />
            Explore Foods Catalog
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Analytics / Quick Tags Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Frequent Searches */}
        <Card className="md:col-span-2 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Frequent & Trending Search Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topKeywords.length > 0 ? (
                topKeywords.map(({ term, count }) => (
                  <button
                    key={term}
                    onClick={() => handleReRunSearch(term)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 group"
                  >
                    <span>{term}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-600 dark:text-slate-300">
                      {count}
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400">Search queries will appear here as you browse.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
              Top Explored Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-xs">
              {categoryStats.slice(0, 3).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{count} queries</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Historical Table and Controls */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Historical Search Activity ({searchHistory.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Saved in IndexedDB storage with instant replay and deletion controls
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter history..."
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Clear All */}
            {confirmClear ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="h-8 text-[11px] px-2.5"
                >
                  Confirm Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmClear(false)}
                  className="h-8 text-[11px] px-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmClear(true)}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map(item => (
              <div 
                key={item.id} 
                className="p-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <Search className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.query ? `"${item.query}"` : 'All Foods Filter'}
                      </span>
                      {item.category && item.category !== 'all' && (
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 bg-slate-50 dark:bg-slate-800">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(item.timestamp)}
                      </span>
                      {typeof item.resultCount === 'number' && (
                        <>
                          <span>•</span>
                          <span>{item.resultCount} {item.resultCount === 1 ? 'result' : 'results'} found</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReRunSearch(item.query, item.category)}
                    className="h-8 text-xs gap-1 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Search Again</span>
                  </Button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                    title="Delete search log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
