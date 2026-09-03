import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { FoodComparisonModal } from '@/components/foods/FoodComparisonModal';
import { SearchFilter } from '@/components/home/SearchFilter';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { FoodItemClient } from '@shared/schema';
import type { SearchFilters } from '@/types';
import { Search, Scale, ArrowLeftRight, Wand2, Sparkles, Download, ShieldCheck, CheckCircle2, Loader2, FileSpreadsheet, ExternalLink, Copy } from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { getFoodItems, searchFoodItems, addSearchHistory } from '@/lib/idb';
import { matchesCategory, sortFoodsAToZ } from '@/lib/categoryUtils';
import { getGoogleImageSearchUrl, getExcelHyperlinkFormula } from '@/lib/foodImageResolver';
import { Button } from '@/components/ui/button';
import { FoodImageStudioModal } from '@/components/foods/FoodImageStudioModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { InGridAdCard } from '@/components/ads/InGridAdCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { FoodGridSkeleton } from '@/components/ui/PageSkeleton';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

export default function Foods() {
  usePageViewCounter('/foods', 'Foods Database Catalog');
  const { getLocalizedText } = useTranslation();
  const { offlineStatus, isLoading: appLoading, foods: contextFoods } = useContext(AppContext);
  const [foods, setFoods] = useState<FoodItemClient[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemClient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [fixMessage, setFixMessage] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<'all' | 'needs_fix' | 'verified'>('all');
  const [fixingItemId, setFixingItemId] = useState<string | null>(null);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);
  const [compareItemA, setCompareItemA] = useState<FoodItemClient | null>(null);
  const [compareItemB, setCompareItemB] = useState<FoodItemClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const catalogTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextFoods && contextFoods.length > 0) {
      const sorted = sortFoodsAToZ(contextFoods);
      setFoods(sorted);

      // Check URL query parameters (e.g. /foods?item=apple or /foods?id=apple)
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('item') || params.get('id');
      if (targetId) {
        const found = sorted.find(f => 
          f.id.toLowerCase() === targetId.toLowerCase() || 
          f.name?.en?.toLowerCase().replace(/\s+/g, '-') === targetId.toLowerCase()
        );
        if (found) {
          setSelectedFood(found);
          setIsDetailOpen(true);
        }
      }
    }
  }, [contextFoods]);

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setCurrentPage(1); // Reset to Page 1 on search / category filter
      let results: FoodItemClient[];
      
      if (offlineStatus === 'offline') {
        // Search in IndexedDB
        results = await searchFoodItems(filters.query, filters.category);
      } else {
        // Source active database foods from context or mockData
        const sourceData = (contextFoods && contextFoods.length > 0) ? contextFoods : foodItems;
        results = [...sourceData];
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          results = results.filter(item => 
            Object.values(item.name || {}).some(val => val && val.toLowerCase().includes(query)) ||
            Object.values(item.description || {}).some(val => val && val.toLowerCase().includes(query)) ||
            (item.origin && item.origin.toLowerCase().includes(query))
          );
        }
        
        if (filters.category !== 'all') {
          results = results.filter(item => matchesCategory(item, filters.category));
        }
      }
      
      // Always sort filtered category results in A-to-Z alphabetical order
      const sortedResults = sortFoodsAToZ(results);
      setFoods(sortedResults);

      // Log historical search data into the existing storage interface
      if (filters.query?.trim() || (filters.category && filters.category !== 'all')) {
        addSearchHistory({
          query: filters.query || '',
          category: filters.category || 'all',
          resultCount: sortedResults.length
        }).catch(err => console.warn('Failed to record search history in foods page:', err));
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(foods.length / PAGE_SIZE) || 1;
  const paginatedFoods = foods.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleViewDetails = (item: FoodItemClient) => {
    setSelectedFood(item);
    setIsDetailOpen(true);
  };

  const handleCompare = (item: FoodItemClient) => {
    if (!compareItemA) {
      setCompareItemA(item);
    } else if (compareItemA.id !== item.id) {
      setCompareItemB(item);
    }
    setIsComparisonOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name (English)', 'Name (Hindi)', 'Name (Tamil)', 'Category', 'Calories (kcal)', 'Carbs (g)', 'Protein (g)', 'Fat (g)', 'Origin'];
    const rows = foodItems.map(f => [
      `"${f.id}"`,
      `"${f.name.en.replace(/"/g, '""')}"`,
      `"${(f.name.hi || '').replace(/"/g, '""')}"`,
      `"${(f.name.ta || '').replace(/"/g, '""')}"`,
      `"${(f.category[0] || '').replace(/"/g, '""')}"`,
      f.nutrition.calories,
      f.nutrition.carbs,
      f.nutrition.protein,
      f.nutrition.fat,
      `"${f.origin.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nutriglobe_complete_food_catalog_${foodItems.length}_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunAutoAudit = async () => {
    setIsAuditing(true);
    setIsAuditOpen(true);
    setFixMessage(null);
    try {
      const res = await fetch('/api/foods/audit-images');
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (e) {
      console.error('Failed to fetch audit data:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAutoFixAll = async () => {
    setIsFixingAll(true);
    setFixMessage(null);
    try {
      const res = await fetch('/api/foods/auto-fix-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setFixMessage(data.message);
        
        // Update local foods state
        if (data.fixedItems && data.fixedItems.length > 0) {
          const fixedMap = new Map(data.fixedItems.map((fi: any) => [fi.id, fi.newImage]));
          setFoods(prevFoods => 
            prevFoods.map(f => fixedMap.has(f.id) ? { ...f, image: fixedMap.get(f.id)!, imageUrl: fixedMap.get(f.id)! } : f)
          );
        }

        // Refresh audit report
        const auditRes = await fetch('/api/foods/audit-images');
        if (auditRes.ok) {
          const auditJson = await auditRes.json();
          setAuditData(auditJson);
        }
      }
    } catch (e) {
      console.error('Failed to auto-fix images:', e);
      setFixMessage('Error running auto-fix. Please check console.');
    } finally {
      setIsFixingAll(false);
    }
  };

  const handleFixSingleItem = async (foodId: string, customUrl?: string) => {
    setFixingItemId(foodId);
    try {
      const res = await fetch(`/api/foods/${foodId}/fix-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: customUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.foodItem) {
          // Update foods list
          setFoods(prev => prev.map(f => f.id === foodId ? { ...f, ...data.foodItem } : f));
          
          // Refresh audit list
          const auditRes = await fetch('/api/foods/audit-images');
          if (auditRes.ok) {
            const auditJson = await auditRes.json();
            setAuditData(auditJson);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fix image for ${foodId}:`, e);
    } finally {
      setFixingItemId(null);
    }
  };

  return (
    // Main container for the foods page
    <div className="py-6 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {getLocalizedText('nav.foods')}
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 shadow-sm">
              1,376 Master Catalog
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore 1,376 unique global, regional, and heritage cultivars with complete nutritional data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/foods/export/google-images-csv" download>
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md gap-1.5 px-3.5 py-2 border border-emerald-500/40"
              title="Download Master CSV containing Google Images search links and =HYPERLINK() Excel formulas for all food items"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Google Images Links CSV</span>
            </Button>
          </a>
          <a href="/api/foods/export/imagen-prompts" download>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md gap-1.5 px-3.5 py-2"
              title="Download bulk Google AI Studio Imagen prompts for all 1,376 items"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Imagen Prompts JSON</span>
            </Button>
          </a>
          <Button
            onClick={handleExportCSV}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md gap-2 px-3.5 py-2"
            title="Export full 1,376 food dataset as CSV"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Catalog CSV ({foodItems.length})</span>
          </Button>
          <Button
            onClick={handleRunAutoAudit}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md gap-1.5 px-3.5 py-2"
            title="Run image accuracy audit for all items with Google Images links"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Auto Check Real Images</span>
          </Button>
          <Button
            onClick={() => setIsStudioOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md gap-2 px-4 py-2"
          >
            <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Food Image Studio</span>
          </Button>
          <Button
            onClick={() => setIsComparisonOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl shadow-md gap-2 px-4 py-2"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Compare Foods (VS)</span>
          </Button>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 hidden md:inline-block">
            Page {currentPage} of {totalPages} ({foods.length.toLocaleString()} Total)
          </span>
        </div>
      </div>
      
      <div ref={catalogTopRef} />
      {/* Top Google AdSense Responsive Banner across all 1,376 foods */}
      <AdBanner slot="1002003001" format="auto" className="my-3" />

      <SearchFilter onSearch={handleSearch} />
      
      {/* Top Pagination Bar */}
      {foods.length > 0 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={foods.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      )}

      {/* No results message */}
      {foods.length === 0 && !isLoading ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium mb-1">
            {getLocalizedText('noResults.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {getLocalizedText('noResults.message')}
          </p>
        </div>
      ) : (isLoading || appLoading) ? (
        // Loading skeleton UI for food cards
        <FoodGridSkeleton count={8} />
      ) : (
        <>
          {/* Grid container for 100 food cards per page with middle-section Ad Space cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 flex-grow mb-8">
            {paginatedFoods.map((item, idx) => (
              <React.Fragment key={item.id}>
                {/* Insert Ad Space card in middle section (e.g. after every 24 items in grid) */}
                {idx > 0 && idx % 24 === 0 && (
                  <InGridAdCard />
                )}
                <FoodCard 
                  item={item}
                  onViewDetails={handleViewDetails}
                  onCompare={handleCompare}
                  showPopularBadge={true}
                />
              </React.Fragment>
            ))}
          </div>

          {/* AdSense Horizontal Banner in middle section */}
          <AdBanner slot="1002003004" format="horizontal" className="my-6" />

          {/* Bottom Pagination Bar (Page 1, 2, 3...) */}
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={foods.length}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
      
      {/* Food Detail Modal */}
      <FoodDetail 
        item={selectedFood}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCompare={handleCompare}
      />

      {/* Side-by-side Food Comparison Modal */}
      <FoodComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        initialItemA={compareItemA}
        initialItemB={compareItemB}
      />

      {/* AI Food Image Studio & Educational Editor Modal */}
      <FoodImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        foodItem={selectedFood}
      />

      {/* 1,376 Food Images Accuracy Auto-Audit Modal */}
      <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 text-white border-slate-800 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              1,376 Food Images Accuracy Auto-Audit Report
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Automated image resolution audit verifying high-definition food photography across all 13 NutriGlobe categories.
            </DialogDescription>
          </DialogHeader>

          {isAuditing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Auditing 1,376 catalog items & image resolutions...</p>
            </div>
          ) : auditData ? (
            <div className="space-y-4 py-2">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block">Total Catalog</span>
                  <span className="text-lg font-bold text-white">{auditData.totalCatalogCount}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block">Verified Accurate</span>
                  <span className="text-lg font-bold text-emerald-400">{auditData.totalVerifiedImages}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block">Action Needed</span>
                  <span className="text-lg font-bold text-amber-300">{auditData.needsFixCount ?? auditData.fallbackResolvedImages}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block">Accuracy Rate</span>
                  <span className="text-lg font-bold text-emerald-400">{auditData.accuracyRate}</span>
                </div>
              </div>

              {/* Auto-Fix Action Bar */}
              <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-emerald-950/80 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                      Auto-Audit Check & Fix Wrong Food Images
                      <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                        Proactive Pipeline
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Automatically scans all items, detects any generic or mismatched images, and applies verified real food photography.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleAutoFixAll}
                  disabled={isFixingAll}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 shrink-0 border border-purple-400/40"
                >
                  {isFixingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                      <span>Fixing Catalog Images...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Auto-Fix All Wrong Images</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Fix Message Notification */}
              {fixMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{fixMessage}</span>
                </div>
              )}

              {/* Category Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Category Image Resolution Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(auditData.categoriesBreakdown || {}).map(([cat, stats]: [string, any]) => (
                    <div key={cat} className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700 text-xs">
                      <div className="font-bold text-slate-200">{cat}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {stats.verified} / {stats.total} verified ({stats.uniqueUrls} unique URLs)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Food List Google Images Search & Auto-Check Explorer */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" />
                      Google Images Search & Live Auto-Fix Explorer
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Query pattern: <code className="text-emerald-300 font-mono">https://www.google.com/search?q=&lt;Food Name&gt;+food&tbm=isch</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="/api/foods/export/google-images-csv" download>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 gap-1">
                        <Download className="w-3 h-3" />
                        Master CSV
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 shrink-0">
                    <button
                      onClick={() => setAuditFilter('all')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        auditFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => setAuditFilter('needs_fix')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        auditFilter === 'needs_fix' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Needs Fix ({auditData.needsFixCount || 0})
                    </button>
                    <button
                      onClick={() => setAuditFilter('verified')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        auditFilter === 'verified' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Verified ({auditData.totalVerifiedImages || 0})
                    </button>
                  </div>

                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Filter foods by name or category..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Explorer Scrollable Item List */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {(auditData.auditResultsList || foodItems || [])
                    .filter((item: any) => {
                      if (auditFilter === 'needs_fix' && !item.needsUpdate && item.status !== 'NEEDS_ACCURATE_IMAGE') {
                        return false;
                      }
                      if (auditFilter === 'verified' && item.needsUpdate) {
                        return false;
                      }
                      if (!auditSearchQuery) return true;
                      const q = auditSearchQuery.toLowerCase();
                      const name = item.name?.en || item.name || item.id || '';
                      return name.toLowerCase().includes(q) || (item.category?.[0] || item.category || '').toLowerCase().includes(q);
                    })
                    .slice(0, 60)
                    .map((item: any) => {
                      const englishName = typeof item.name === 'string' ? item.name : (item.name?.en || item.id);
                      const currentImage = item.imageUrl || item.image;
                      const searchUrl = item.googleSearchUrl || getGoogleImageSearchUrl(englishName, item.category);
                      const excelFormula = item.excelFormula || getExcelHyperlinkFormula(englishName);
                      const isCopied = copiedFormulaId === item.id;
                      const isItemFixing = fixingItemId === item.id;
                      const isNeedsFix = item.needsUpdate || item.status === 'NEEDS_ACCURATE_IMAGE';

                      return (
                        <div 
                          key={item.id} 
                          className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all ${
                            isNeedsFix 
                              ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/40' 
                              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {currentImage ? (
                              <img
                                src={currentImage}
                                alt={englishName}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-900"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                                No Img
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white truncate">{englishName}</span>
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                                  {Array.isArray(item.category) ? item.category[0] : (item.category || 'General')}
                                </span>
                                {isNeedsFix ? (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                                    Needs Fix
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-emerald-400/80 font-mono truncate mt-0.5" title={excelFormula}>
                                {excelFormula}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {/* Auto-Fix button */}
                            <Button
                              size="sm"
                              onClick={() => handleFixSingleItem(item.id, item.recommendedImageUrl)}
                              disabled={isItemFixing}
                              className={`h-6 text-[10px] font-bold px-2 rounded-md ${
                                isNeedsFix 
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                              }`}
                            >
                              {isItemFixing ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin mr-1" />
                              ) : (
                                <ShieldCheck className="w-2.5 h-2.5 mr-1 text-emerald-300" />
                              )}
                              {isItemFixing ? 'Updating...' : 'Fix Image'}
                            </Button>

                            {/* Copy formula */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(excelFormula);
                                setCopiedFormulaId(item.id);
                                setTimeout(() => setCopiedFormulaId(null), 2000);
                              }}
                              className="h-6 text-[10px] px-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-700 border border-slate-700"
                            >
                              <Copy className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                              {isCopied ? 'Copied' : 'Formula'}
                            </Button>

                            {/* Google Photos link */}
                            <a
                              href={searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-6 px-2 text-[10px] font-bold rounded-md bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 transition-colors"
                            >
                              <span>Google Photos</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
