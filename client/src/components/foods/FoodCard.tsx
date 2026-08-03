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
    return [`#${cleanName}`, `#${firstCat}Health`, `#SuperfoodRDA`, `#NutriGlobe`].slice(0, 3);
  };

  const hashtags = generateViralHashtags(item.name.en, item.category);
  const nutrientHighlight = getNutrientHighlight();

  return (
    <Card className="overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="relative h-40 xs:h-48 overflow-hidden group">
        <LazyImage 
          src={imageUrl} 
          alt={t(item.name)} 
          onError={(e) => handleFoodImageError(e, item.category)}
          containerClassName="w-full h-full"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Quick action buttons - more visible on mobile with default opacity */}
        <div className="absolute top-2 right-2 flex gap-2 transition-opacity duration-300 xs:opacity-0 xs:group-hover:opacity-100">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            className={`rounded-full p-2 ${isItemFavorite ? 'bg-pink-500 text-white' : 'bg-white/90 text-pink-500'} shadow hover:shadow-md transition-all`}
            aria-label={getLocalizedText('button.favorite')}
          >
            <Heart className="h-4 w-4" fill={isItemFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            className="rounded-full p-2 bg-white/90 text-primary-500 shadow hover:shadow-md transition-all"
            aria-label={getLocalizedText('button.details')}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        
        {/* Tags and badges */}
        <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-3 flex justify-between items-end">
          <div className="flex flex-wrap gap-1 max-w-[75%]">
            {item.category.slice(0, isMobile ? 1 : 2).map(tag => (
              <Badge key={tag} variant="secondary" className="bg-white/30 backdrop-blur-sm text-white border-none text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {item.isPopular && showPopularBadge && (
            <Badge variant="outline" className="bg-orange-500 border-none text-white">
              <Star className="h-3 w-3 mr-1 fill-white" /> {getLocalizedText('tag.popular')}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-2 xs:p-3 sm:p-4 flex-1 flex flex-col" onClick={() => onViewDetails(item)}>
        <div>
          <h3 className="font-medium text-base xs:text-lg line-clamp-1 hover:text-primary-500 transition-colors">
            {t(item.name)}
          </h3>
          <p className="text-gray-500 text-xs xs:text-sm dark:text-gray-400">{item.origin}</p>
        </div>
        
        <p className="mt-1 xs:mt-2 text-gray-600 text-xs xs:text-sm line-clamp-2 dark:text-gray-300">
          {truncate(t(item.description), isMobile ? 60 : 100)}
        </p>
        
        {/* Viral High-Volume Search Hashtags for Google SEO & Social Discovery */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {hashtags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition Preview - Grid on larger screens, horizontal scroll on mobile */}
        <div className="mt-2 xs:mt-3 grid grid-cols-3 gap-1 xs:gap-2">
          <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50">
            <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400">
              {getLocalizedText('food.calories')}
            </span>
            <span className="font-mono text-xs xs:text-sm font-medium">{item.nutrition.calories}</span>
          </div>
          <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50">
            <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400">
              {getLocalizedText('food.protein')}
            </span>
            <span className="font-mono text-xs xs:text-sm font-medium">{item.nutrition.protein}g</span>
          </div>
          <div className="flex flex-col items-center p-1 rounded bg-gray-50 dark:bg-gray-700/50">
            <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400">
              {getLocalizedText('food.carbs')}
            </span>
            <span className="font-mono text-xs xs:text-sm font-medium">{item.nutrition.carbs}g</span>
          </div>
        </div>
        
        {/* Nutrient Highlight - Show only on larger screens */}
        {nutrientHighlight && (
          <div className="mt-2 xs:mt-3 hidden xs:block">
            <Badge variant="outline" className="w-full justify-center py-1 xs:py-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400 text-xs">
              {getLocalizedText(`filter.${nutrientHighlight}`) || nutrientHighlight.replace('_', ' ')}
            </Badge>
          </div>
        )}
        
        {/* Action buttons - Smaller on mobile */}
        <div className="mt-2 xs:mt-4 flex gap-1 xs:gap-1.5 mt-auto">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            variant="default" 
            className="flex-1 h-8 xs:h-10 text-xs xs:text-sm"
          >
            <Info className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-1.5" />
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
              className="px-2 h-8 xs:h-10 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <Scale className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            variant={isItemFavorite ? "secondary" : "outline"}
            className={`w-8 xs:w-10 p-0 h-8 xs:h-10 flex items-center justify-center ${isItemFavorite ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400' : ''}`}
          >
            <Heart 
              className="h-4 w-4 xs:h-5 xs:w-5" 
              fill={isItemFavorite ? "currentColor" : "none"} 
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
