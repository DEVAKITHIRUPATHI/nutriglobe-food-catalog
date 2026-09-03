import { useState, useEffect, useContext, useRef } from 'react';
import React from 'react';
import { Link } from 'wouter';
import { Hero } from '@/components/home/Hero';
import { SearchFilter } from '@/components/home/SearchFilter';
import { HomeCaloricIntakeChart } from '@/components/home/HomeCaloricIntakeChart';
import { HydrationTracker } from '@/components/home/HydrationTracker';
import { NutritionGuide } from '@/components/home/NutritionGuide';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { AdBanner } from '@/components/ads/AdBanner';
import { AmazonAdBanner } from '@/components/ads/AmazonAdBanner';
import { InGridAdCard } from '@/components/ads/InGridAdCard';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { FoodItemClient } from '@shared/schema';
import type { SearchFilters } from '@/types';
import { ArrowRight, AlertCircle, Search } from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { getFoodItems, searchFoodItems, addSearchHistory } from '@/lib/idb';
import { matchesCategory, sortFoodsAToZ } from '@/lib/categoryUtils';
import { usePageViewCounter } from '@/hooks/usePageViewCounter';

import { FoodGridSkeleton } from '@/components/ui/PageSkeleton';

export default function Home() {
  usePageViewCounter('/', 'Home Page');
  const { getLocalizedText } = useTranslation();
  const { offlineStatus, isLoading: appLoading, foods: contextFoods } = useContext(AppContext);
  const [popularFoods, setPopularFoods] = useState<FoodItemClient[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItemClient[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemClient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextFoods && contextFoods.length > 0) {
      const popular = contextFoods.filter(item => item.isPopular);
      setPopularFoods(popular.length > 0 ? popular : contextFoods.slice(0, 8));
      setFilteredFoods(sortFoodsAToZ(contextFoods));
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
      
      const sortedResults = sortFoodsAToZ(results);
      setFilteredFoods(sortedResults);

      // Log historical search data into the existing storage interface
      if (filters.query?.trim() || (filters.category && filters.category !== 'all')) {
        addSearchHistory({
          query: filters.query || '',
          category: filters.category || 'all',
          resultCount: sortedResults.length
        }).catch(err => console.warn('Failed to record search history:', err));
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(filteredFoods.length / PAGE_SIZE) || 1;
  const paginatedFoods = filteredFoods.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Function to handle viewing food details
  const handleViewDetails = (item: FoodItemClient) => {
    setSelectedFood(item);
    setIsDetailOpen(true);
  };

  return (
    <>
    {/* Hero Section */}
      <Hero />
       {/* Search Filter Section */}
      <SearchFilter onSearch={handleSearch} />

      {/* Daily Caloric Intake Chart Synced with CartContext */}
      <div className="px-4 max-w-7xl mx-auto space-y-6">
        <HomeCaloricIntakeChart />
        <HydrationTracker />
      </div>
      
      {/* Popular Items Section */}
      
     {/* Container for popular food items */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {getLocalizedText('popular.foods')}
          </h2>
          <Link href="/foods">
            <span className="text-primary-500 hover:underline flex items-center cursor-pointer">
              {getLocalizedText('view.all')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </Link>
        </div>
        
         {/* Loading state UI */}
        {isLoading || appLoading ? (
           <FoodGridSkeleton count={8} />
         ) : (
           <>
            {/* Grid layout for displaying food cards on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularFoods.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
           </>
        )}
      </section>

      {/* Featured Amazon Kitchen & Wellness Grid Ad */}
      <div className="max-w-7xl mx-auto px-4 my-6">
        <AmazonAdBanner format="grid" category="kitchen" maxItems={2} title="Top Amazon Deals: Kitchen & Macro Tracking Equipment" />
      </div>
      
     {/* All Foods Section */}
     {/* Container for all food items */}
      <section className="mb-8 max-w-7xl mx-auto px-4">
        <div ref={gridTopRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-2xl font-semibold">
             {getLocalizedText('all.foods')}
          </h2>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            Page {currentPage} of {totalPages} ({filteredFoods.length.toLocaleString()} Total)
          </span>
        </div>
        
        {/* Top Pagination Bar */}
        {filteredFoods.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredFoods.length}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}

        {/* No results message */}
        {filteredFoods.length === 0 && !isLoading ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">
              {getLocalizedText('noResults.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {getLocalizedText('noResults.message')}
             </p>
          </div>
        ) : isLoading ? (
          <FoodGridSkeleton count={8} />
        ) : (
          <>
            {/* Grid layout for displaying 100 food cards per page with middle section Ad Space cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {paginatedFoods.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {/* Insert Ad Space card in middle section (e.g. after every 24 items in grid) */}
                  {idx > 0 && idx % 24 === 0 && (
                    <InGridAdCard />
                  )}
                  <FoodCard
                    item={item}
                    onViewDetails={handleViewDetails}
                    showPopularBadge={true}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Bottom Pagination Bar (Page 1, 2, 3...) */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredFoods.length}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

          {/* AdSense Placement Slot */}
          <AdBanner slot="9876543210" format="horizontal" />

          {/* Calculator Callout Section */}
          <section className="my-12 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-block bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Interactive Health Feature
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Calculate Your Personal BMR, TDEE & Medical RDA
                </h2>
                <p className="text-indigo-100/80 text-xs sm:text-sm max-w-2xl">
                  Input your age, weight, and activity level to receive instant WHO-standard BMI classifications, calorie targets, and age-based Recommended Dietary Allowances.
                </p>
              </div>
              <Link href="/calculator">
                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-transform hover:scale-105 flex items-center gap-2 whitespace-nowrap cursor-pointer">
                  <span>Open Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </section>

          {/* Nutrition Guide Section */}
          <NutritionGuide />
          {/* Food Detail Modal */}

          {/* Food Detail Modal */}
          <FoodDetail
        item={selectedFood}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}

