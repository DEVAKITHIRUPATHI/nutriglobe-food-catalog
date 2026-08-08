import { useContext } from 'react';
import { FoodItemClient } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { CartContext } from '@/contexts/CartContext';
import { Scale, Heart, Info, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAccurateFoodImage, handleFoodImageError } from '@/lib/foodImageResolver';
import { LazyImage } from '@/components/ui/LazyImage';

interface FoodCardProps {
  item: FoodItemClient;
  onViewDetails: (item: FoodItemClient) => void;
  onCompare?: (item: FoodItemClient) => void;
  showPopularBadge?: boolean;
}

export function FoodCard({ item, onViewDetails, onCompare, showPopularBadge = true }: FoodCardProps) {
  const { t, getLocalizedText } = useTranslation();
  const { addToCart, isFavorite } = useContext(CartContext);
  const isMobile = useIsMobile();
  const isItemFavorite = isFavorite(item.id);
  const imageUrl = getAccurateFoodImage(item);

  // Helper function to truncate text for mobile view
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Get most relevant nutritional information to highlight
  const getNutrientHighlight = () => {
    if (item.nutrition.protein > 20) return 'high_protein';
    if (item.nutrition.fiber > 8) return 'high_fiber';
    if (item.nutrition.carbs < 5) return 'low_carb';
    if (item.nutrition.fat < 3) return 'low_fat';
    if (item.nutrition.vitamins?.['A'] && parseFloat(item.nutrition.vitamins['A']) > 30) return 'high_vitamin_a';
    if (item.nutrition.vitamins?.['C'] && parseFloat(item.nutrition.vitamins['C']) > 60) return 'high_vitamin_c';
    if (item.nutrition.omega3 && item.nutrition.omega3 > 1.5) return 'high_omega3';
    return null;
  };

  // Generate high-volume viral search hashtags based on food name and category
  const generateViralHashtags = (nameStr: string, categories: string[]) => {
    const cleanName = nameStr.replace(/[^a-zA-Z0-9]/g, '');
    const firstCat = categories[0] ? categories[0].replace(/[^a-zA-Z0-9]/g, '') : 'Nutrition';
    return [`#${cleanName}`, `#${firstCat}Health`, `#NutriFacts`].slice(0, 3);
  };

  const hashtags = generateViralHashtags(item.name.en, item.category);
  const nutrientHighlight = getNutrientHighlight();

  return (
    <Card 
      onClick={() => onViewDetails(item)}
      className="group relative overflow-hidden h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl cursor-pointer"
    >
      {/* Top Colorful Gradient Edge Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 via-sky-500 to-amber-500" />

      {/* Image Container */}
      <div className="relative h-44 xs:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {/* Source badge tag */}
        {item.imageSourceType === 'ai_generated' && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-purple-900/90 text-purple-200 backdrop-blur-md text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-400/40 shadow-sm uppercase tracking-wider">
              AI Photo
            </span>
          </div>
        )}

        <LazyImage 
          src={imageUrl} 
          alt={t(item.name)} 
          onError={(e) => handleFoodImageError(e, item.category)}
          containerClassName="w-full h-full"
          className="transition-transform duration-700 ease-out group-hover:scale-110 object-cover"
        />
        
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {/* Floating Favorite & Info Buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            className={`rounded-full p-2.5 ${isItemFavorite ? 'bg-rose-500 text-white shadow-rose-500/50 scale-105' : 'bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-rose-500 hover:text-white'} shadow-md hover:scale-110 transition-all duration-200 backdrop-blur-md`}
            aria-label={getLocalizedText('button.favorite')}
          >
            <Heart className="h-4 w-4" fill={isItemFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            className="rounded-full p-2.5 bg-white/90 dark:bg-slate-900/90 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white shadow-md hover:scale-110 transition-all duration-200 backdrop-blur-md"
            aria-label={getLocalizedText('button.details')}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        
        {/* Category Badges & Popular Tag on Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end gap-2">
          <div className="flex flex-wrap gap-1 max-w-[75%]">
            {item.category.slice(0, isMobile ? 1 : 2).map((tag, idx) => (
              <span 
                key={tag} 
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border shadow-xs ${
                  idx % 2 === 0 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {item.isPopular && showPopularBadge && (
            <Badge className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border-none shadow-md animate-pulse">
              <Star className="h-3 w-3 mr-1 fill-slate-950 inline" /> Popular
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/80">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {t(item.name)}
          </h3>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400/90">{item.origin || 'Global'}</p>
        </div>
        
        <p className="mt-1.5 text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
          {truncate(t(item.description), isMobile ? 65 : 100)}
        </p>
        
        {/* Viral Hashtags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {hashtags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-md border border-teal-200/80 dark:border-teal-800/40">
              {tag}
            </span>
          ))}
        </div>

        {/* Multi-Color Nutrition Macro Pills */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {/* Calories - Amber */}
          <div className="flex flex-col items-center p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 group-hover:border-amber-400/50 transition-colors">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Calories
            </span>
            <span className="font-extrabold text-xs sm:text-sm font-mono">{item.nutrition.calories}</span>
          </div>

          {/* Protein - Rose */}
          <div className="flex flex-col items-center p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 group-hover:border-rose-400/50 transition-colors">
            <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Protein
            </span>
            <span className="font-extrabold text-xs sm:text-sm font-mono">{item.nutrition.protein}g</span>
          </div>

          {/* Carbs - Sky */}
          <div className="flex flex-col items-center p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-900 dark:text-sky-200 group-hover:border-sky-400/50 transition-colors">
            <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Carbs
            </span>
            <span className="font-extrabold text-xs sm:text-sm font-mono">{item.nutrition.carbs}g</span>
          </div>
        </div>
        
        {/* Nutrient Highlight Badge */}
        {nutrientHighlight && (
          <div className="mt-2.5">
            <span className="block text-center py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              ✨ {getLocalizedText(`filter.${nutrientHighlight}`) !== `filter.${nutrientHighlight}`
                ? getLocalizedText(`filter.${nutrientHighlight}`)
                : nutrientHighlight.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        
        {/* Ad Space Ribbon in Card */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            window.open('https://www.amazon.com/dp/B0113GAN44?tag=nutriglobe20-20', '_blank', 'noopener,noreferrer');
          }}
          className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all flex items-center justify-between cursor-pointer group/ad"
          title="Sponsored Kitchen Tool: Digital Food Scale & Macro Tracker on Amazon"
        >
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
              Ad Deal
            </span>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 truncate max-w-[130px]">
              0.1g Digital Scale $13.99
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 group-hover/ad:underline flex items-center gap-0.5">
            View <span className="text-xs">↗</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2 flex gap-1.5 mt-auto border-t border-slate-100 dark:border-slate-800/80">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            className="flex-1 h-9 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm"
          >
            <Info className="h-3.5 w-3.5 mr-1" />
            {getLocalizedText('button.details')}
          </Button>
          {onCompare && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(item);
              }}
              variant="outline"
              title="Compare with another food"
              className="px-2.5 h-9 text-xs font-bold text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            >
              <Scale className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            variant="outline"
            className={`w-9 p-0 h-9 flex items-center justify-center rounded-xl transition-all ${
              isItemFavorite 
                ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' 
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            <Heart 
              className="h-4 w-4" 
              fill={isItemFavorite ? "currentColor" : "none"} 
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
