import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Trash2, Search, ArrowUpDown, Flame, Dumbbell, 
  ExternalLink, Sparkles, Filter, Apple, CheckCircle2 
} from 'lucide-react';
import type { FoodItemClient } from '@shared/schema';
import { useTranslation } from '@/hooks/useTranslation';

interface SavedFavoritesViewProps {
  favoriteItems: {
    id: string; // cart item db id
    foodItem: FoodItemClient;
    quantity: number;
  }[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
}

export function SavedFavoritesView({
  favoriteItems,
  onRemoveFavorite,
  onClearAll
}: SavedFavoritesViewProps) {
  const { getLocalizedText } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'calories-desc' | 'protein-desc' | 'price-desc'>('alpha');
  const [confirmClear, setConfirmClear] = useState(false);

  // Extract available categories from current favorites
  const categories = useMemo(() => {
    const set = new Set<string>();
    favoriteItems.forEach(item => {
      if (Array.isArray(item.foodItem.category)) {
        item.foodItem.category.forEach(c => set.add(c.toLowerCase()));
      }
    });
    return ['all', ...Array.from(set)];
  }, [favoriteItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let list = [...favoriteItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => {
        const nameObj = item.foodItem.name || {};
        const matchesName = Object.values(nameObj).some(val => val && val.toLowerCase().includes(q));
        const matchesDesc = Object.values(item.foodItem.description || {}).some(val => val && val.toLowerCase().includes(q));
        const matchesOrigin = item.foodItem.origin && item.foodItem.origin.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesOrigin;
      });
    }

    if (selectedCategory !== 'all') {
      list = list.filter(item => {
        if (!Array.isArray(item.foodItem.category)) return false;
        return item.foodItem.category.some(c => c.toLowerCase() === selectedCategory);
      });
    }

    list.sort((a, b) => {
      const nameA = a.foodItem.name?.en || '';
      const nameB = b.foodItem.name?.en || '';
      const calA = a.foodItem.nutrition?.calories || 0;
      const calB = b.foodItem.nutrition?.calories || 0;
      const protA = a.foodItem.nutrition?.protein || 0;
      const protB = b.foodItem.nutrition?.protein || 0;
      const priceA = a.foodItem.price || 0;
      const priceB = b.foodItem.price || 0;

      if (sortBy === 'calories-desc') return calB - calA;
      if (sortBy === 'protein-desc') return protB - protA;
      if (sortBy === 'price-desc') return priceB - priceA;
      return nameA.localeCompare(nameB);
    });

    return list;
  }, [favoriteItems, searchQuery, selectedCategory, sortBy]);

  // Helper to extract localized food name
  const getFoodName = (food: FoodItemClient) => {
    return food.name?.en || food.name?.hi || food.name?.ta || 'Nutritious Food';
  };

  if (favoriteItems.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <CardContent className="p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Saved Favorites Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bookmark foods you eat or love to calculate your personalized nutrition breakdown and dietary coverage.
            </p>
          </div>
          <Link href="/foods">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs">
              <Apple className="w-4 h-4" />
              Browse & Save Foods
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved foods..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Sort & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="alpha">Sort: A-Z</option>
              <option value="calories-desc">Calories: High to Low</option>
              <option value="protein-desc">Protein: High to Low</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Clear All Confirmation */}
          {confirmClear ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onClearAll();
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
              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear All ({favoriteItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.map(item => {
          const food = item.foodItem;
          const nutrition = food.nutrition || {};

          return (
            <Card 
              key={item.id} 
              className="group overflow-hidden border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-3.5 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                    <img
                      src={food.image || ''}
                      alt={getFoodName(food)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                    {food.origin && (
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] px-1 bg-black/60 text-white rounded font-mono">
                        {food.origin.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Title and Category */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <Link href={`/food/${food.id}`}>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate">
                          {getFoodName(food)}
                        </h4>
                      </Link>
                      <button
                        onClick={() => onRemoveFavorite(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors shrink-0"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(food.category) && food.category.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nutrition Pills */}
                <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-center text-[10px]">
                  <div>
                    <div className="text-slate-500 font-medium">Calories</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{nutrition.calories || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Protein</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">{nutrition.protein || 0}g</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Carbs</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">{nutrition.carbs || 0}g</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Fiber</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{nutrition.fiber || 0}g</div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {food.price ? `₹${food.price}` : 'Priceless'}
                  </span>
                  <Link href={`/food/${food.id}`}>
                    <span className="text-[11px] font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 cursor-pointer">
                      Food Details
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
