import { useState, useEffect, useContext } from 'react';
import { FoodCard } from '@/components/foods/FoodCard';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { FoodComparisonModal } from '@/components/foods/FoodComparisonModal';
import { SearchFilter } from '@/components/home/SearchFilter';
import { useTranslation } from '@/hooks/useTranslation';
import { AppContext } from '@/contexts/AppContext';
import { FoodItemClient } from '@shared/schema';
import type { SearchFilters } from '@/types';
import { Search, Scale, ArrowLeftRight, Wand2, Sparkles } from 'lucide-react';
import { foodItems } from '@shared/mockData';
import { getFoodItems, searchFoodItems } from '@/lib/idb';
import { Button } from '@/components/ui/button';
import { FoodImageStudioModal } from '@/components/foods/FoodImageStudioModal';

import { FoodGridSkeleton } from '@/components/ui/PageSkeleton';

export default function Foods() {
  const { getLocalizedText } = useTranslation();
  const { offlineStatus, isLoading: appLoading } = useContext(AppContext);
  const [foods, setFoods] = useState<FoodItemClient[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItemClient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [compareItemA, setCompareItemA] = useState<FoodItemClient | null>(null);
  const [compareItemB, setCompareItemB] = useState<FoodItemClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        
        if (offlineStatus === 'offline') {
          // Use IndexedDB in offline mode
          const items = await getFoodItems();
          setFoods(items);
        } else {
          // Use mock data for now, in a real app this would be an API call
          setFoods([...foodItems]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching foods:', error);
        setIsLoading(false);
      }
    };

    fetchFoods();
  }, [offlineStatus]);

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setVisibleCount(24); // Reset pagination on search
      let results: FoodItemClient[];
      
      if (offlineStatus === 'offline') {
        // Search in IndexedDB
        results = await searchFoodItems(filters.query, filters.category);
      } else {
        // Filter mock data
        results = [...foodItems];
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          results = results.filter(item => 
            Object.values(item.name).some(val => val && val.toLowerCase().includes(query)) ||
            Object.values(item.description).some(val => val && val.toLowerCase().includes(query))
          );
        }
        
        if (filters.category !== 'all') {
          results = results.filter(item => 
            item.category.includes(filters.category)
          );
        }
      }
      
      setFoods(results);
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };

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

  const visibleFoods = foods.slice(0, visibleCount);

  return (
    // Main container for the foods page
    <div className="py-6 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {getLocalizedText('nav.foods')}
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 shadow-sm">
              100,000+ Master Database
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore 100,000 global, regional, and heritage cultivars with complete nutritional data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            Showing {visibleFoods.length.toLocaleString()} of {foods.length.toLocaleString()} foods
          </span>
        </div>
      </div>
      
      <SearchFilter onSearch={handleSearch} />
      
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
          {/* Grid container for food cards with responsive design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 flex-grow mb-8">
            {visibleFoods.map((item) => (
              <FoodCard 
                key={item.id}
                item={item}
                onViewDetails={handleViewDetails}
                onCompare={handleCompare}
                showPopularBadge={true}
              />
            ))}
          </div>

          {/* Load More & Fast Pagination */}
          {visibleCount < foods.length && (
            <div className="flex flex-col items-center gap-3 my-8">
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  Load Next 24 Foods
                </button>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 100)}
                  className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl shadow-md transition-all"
                >
                  +100 Items
                </button>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 500)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-emerald-300 font-semibold rounded-xl shadow-md transition-all"
                >
                  +500 Bulk
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {(foods.length - visibleCount).toLocaleString()} items remaining in current search catalog
              </span>
            </div>
          )}
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
    </div>
  );
}
