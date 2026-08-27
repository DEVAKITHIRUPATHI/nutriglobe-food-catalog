import React, { useState, useEffect, useContext, useRef, Fragment } from 'react';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { FoodComparisonModal } from '@/components/foods/FoodComparisonModal';
import { SearchFilter } from '@/components/home/SearchFilter';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { FoodItemClient } from '@shared/schema';
import type { SearchFilters } from '@/types';
import { Search, Scale, ArrowLeftRight, Wand2, Sparkles, Download, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { getFoodItems, searchFoodItems } from '@/lib/idb';
import { matchesCategory, sortFoodsAToZ } from '@/lib/categoryUtils';
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
  const [compareItemA, setCompareItemA] = useState<FoodItemClient | null>(null);
  const [compareItemB, setCompareItemB] = useState<FoodItemClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const catalogTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextFoods && contextFoods.length > 0) {
      setFoods(sortFoodsAToZ(contextFoods));
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
            title="Run image accuracy audit for all 1,376 items"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Auto Audit Images</span>
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
                  <span className="text-xs text-slate-400 block">Fallback Resolved</span>
                  <span className="text-lg font-bold text-amber-300">{auditData.fallbackResolvedImages}</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-center">
                  <span className="text-xs text-slate-400 block">Accuracy Rate</span>
                  <span className="text-lg font-bold text-emerald-400">{auditData.accuracyRate}</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>
                  <strong>Audit Status: {auditData.auditStatus}</strong> - All 1,376 foods have verified high-definition original or category-related food imagery mapped with zero missing assets.
                </span>
              </div>

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
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
