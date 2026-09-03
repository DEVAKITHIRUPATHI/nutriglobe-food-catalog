import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartContext } from '@/contexts/CartContext';
import { 
  Sparkles, Heart, Check, Plus, ArrowRight, ShieldCheck, 
  Flame, Dumbbell, Zap, RefreshCw, Filter 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FoodItemClient } from '@shared/schema';

interface RecommendationItem {
  food: FoodItemClient;
  score: number;
  matchReason: string;
  healthTags: string[];
  keyNutrientHighlight?: string;
}

interface ClinicalRecommendationsViewProps {
  currentFocus?: string;
  onFocusChange?: (focus: string) => void;
}

const FOCUS_OPTIONS = [
  { id: 'balanced', label: 'Balanced Wellness', icon: Zap },
  { id: 'high_protein', label: 'High Protein', icon: Dumbbell },
  { id: 'plant_based', label: 'Plant-Based', icon: Sparkles },
  { id: 'heart_health', label: 'Cardio-Protective', icon: Heart },
  { id: 'gut_health', label: 'Microbiome Health', icon: ShieldCheck },
  { id: 'low_carb', label: 'Low Glycemic', icon: Flame },
];

export function ClinicalRecommendationsView({
  currentFocus = 'balanced',
  onFocusChange
}: ClinicalRecommendationsViewProps) {
  const [selectedFocus, setSelectedFocus] = useState<string>(currentFocus);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [rationale, setRationale] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { cartItems, addToCart } = useContext(CartContext);
  const { toast } = useToast();

  const fetchRecommendations = async (focus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/recommendations?focus=${focus}&limit=6`);
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
        setRationale(data.rationale || '');
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedFocus);
  }, [selectedFocus]);

  const handleSelectFocus = (focusId: string) => {
    setSelectedFocus(focusId);
    if (onFocusChange) onFocusChange(focusId);
  };

  const handleAddToFavorites = async (food: FoodItemClient) => {
    addToCart(food);
    // Also sync to server storage
    try {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, foodItemId: food.id })
      });
    } catch (e) {
      // CartContext already manages local state
    }
    toast({
      title: 'Added to Favorites',
      description: `${food.name?.en || 'Food'} was added to your saved favorites list.`
    });
  };

  const isFavorited = (foodId: string) => {
    return cartItems.some(item => item.foodItem.id === foodId);
  };

  return (
    <div className="space-y-4">
      {/* Focus selector header */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-blue-50/40 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-blue-950/20">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Algorithmic Clinical Recommendations
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                {rationale || 'Tailored whole-food recommendations calculated against your nutrient balance and metabolic goals.'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecommendations(selectedFocus)}
              disabled={isLoading}
              className="gap-1.5 self-start sm:self-auto h-9 text-xs font-semibold bg-white dark:bg-slate-900"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Focus Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            {FOCUS_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isActive = selectedFocus === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectFocus(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-slate-200/80 dark:border-slate-800 animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-lg" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="border-slate-200/80 dark:border-slate-800 p-8 text-center">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            All matching foods are already in your favorites!
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try choosing a different nutritional focus above to discover more superfoods.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map(({ food, score, matchReason, healthTags, keyNutrientHighlight }) => {
            const favorited = isFavorited(food.id);
            const n = food.nutrition || ({} as any);

            return (
              <Card 
                key={food.id}
                className="border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Header with Match Score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.name?.en || 'Food'}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {food.name?.en?.charAt(0) || 'F'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {food.name?.en}
                          </h4>
                          {food.name?.hi && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {food.name.hi} {food.name.ta ? `• ${food.name.ta}` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge 
                        variant="outline" 
                        className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[11px] font-black shrink-0"
                      >
                        {score}% Match
                      </Badge>
                    </div>

                    {/* Key Nutrient Highlight */}
                    {keyNutrientHighlight && (
                      <div className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        ⚡ {keyNutrientHighlight}
                      </div>
                    )}

                    {/* Clinical Match Reason */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {matchReason}
                    </p>

                    {/* Health Tags */}
                    {healthTags && healthTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {healthTags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer with Quick Macros and Add button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500 font-mono">
                      {n.calories || 0} kcal • {n.protein || 0}g P
                    </div>

                    <Button
                      size="sm"
                      variant={favorited ? 'secondary' : 'default'}
                      onClick={() => handleAddToFavorites(food)}
                      disabled={favorited}
                      className={`h-8 text-xs font-semibold gap-1.5 ${
                        favorited 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 cursor-default' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900'
                      }`}
                    >
                      {favorited ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Favorite
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
