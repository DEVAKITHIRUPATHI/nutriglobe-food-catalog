import { useContext, useState } from 'react';
import { Link } from 'wouter';
import { CartContext } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Heart as FavoriteIcon, Info, X, LayoutDashboard } from 'lucide-react';
import { FoodDetail } from '@/components/foods/FoodDetail';
import { FoodItemClient } from '@shared/schema';
import { LazyImage } from '@/components/ui/LazyImage';

export function ShoppingCart() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart 
  } = useContext(CartContext);
  const { t, getLocalizedText } = useTranslation();
  const [selectedFood, setSelectedFood] = useState<FoodItemClient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (foodItem: FoodItemClient) => {
    setSelectedFood(foodItem);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={closeCart}>
        <SheetContent className="w-full sm:max-w-md pr-0 flex flex-col">
          <SheetHeader className="px-4 sm:px-6">
            <SheetTitle>{getLocalizedText('cart.title')}</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <FavoriteIcon className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 mb-1 dark:text-white">
                  {getLocalizedText('cart.empty')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getLocalizedText('cart.emptyMessage')}
                </p>
                <Button 
                  onClick={closeCart}
                  className="mt-4"
                >
                  {getLocalizedText('cart.continueShopping')}
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                      <LazyImage 
                        src={item.foodItem.image} 
                        alt={t(item.foodItem.name)} 
                        containerClassName="w-full h-full"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                          <h3>{t(item.foodItem.name)}</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.foodItem.origin}</p>
                      </div>
                      
                      {/* Nutrition Preview */}
                      <div className="mt-2 flex items-center space-x-3">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getLocalizedText('food.calories')}
                          </span>
                          <span className="font-mono font-medium">{item.foodItem.nutrition.calories}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getLocalizedText('food.protein')}
                          </span>
                          <span className="font-mono font-medium">{item.foodItem.nutrition.protein}g</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getLocalizedText('food.carbs')}
                          </span>
                          <span className="font-mono font-medium">{item.foodItem.nutrition.carbs}g</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex justify-between items-end text-sm mt-3">
                        <div>
                          <button 
                            onClick={() => handleViewDetails(item.foodItem)} 
                            className="flex items-center text-primary-600 hover:text-primary-700"
                          >
                            <Info className="h-4 w-4 mr-1" />
                            {getLocalizedText('food.viewDetails')}
                          </button>
                        </div>
                        <div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="font-medium text-red-500 hover:text-red-700"
                          >
                            {getLocalizedText('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 py-4 px-4 sm:px-6 dark:border-gray-700 space-y-2">
              <Link href="/dashboard" onClick={closeCart}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-xs font-bold py-2 shadow-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Open Full User Dashboard
                </Button>
              </Link>
              <div className="flex justify-center text-xs text-center text-gray-500">
                <button 
                  onClick={closeCart} 
                  className="text-primary-500 font-medium hover:text-primary-600"
                >
                  {getLocalizedText('cart.continueShopping')} &rarr;
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Food Details Modal */}
      <FoodDetail 
        item={selectedFood} 
        isOpen={detailsOpen} 
        onClose={closeDetails} 
      />
    </>
  );
}
