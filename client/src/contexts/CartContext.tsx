import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { 
  getCartItems, 
  addToCart as addToCartDB, 
  removeFromCart as removeFromCartDB,
  clearCart as clearCartDB,
  getFoodItemById
} from '@/lib/idb';
import type { FoodItemClient } from '@shared/schema';
import { AppContext } from './AppContext';

// Renamed to FavoriteItem to better reflect its purpose
interface FavoriteItem {
  id: string;
  foodItem: FoodItemClient;
  quantity: number; // Keeping for backwards compatibility with database
}

// Renamed to FavoritesContextProps to better reflect its purpose
interface FavoritesContextProps {
  cartItems: FavoriteItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (foodItem: FoodItemClient) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isFavorite: (foodId: string) => boolean;
}

// We're keeping the name CartContext for backward compatibility
export const CartContext = createContext<FavoritesContextProps>({
  cartItems: [],
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  isFavorite: () => false,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<FavoriteItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isLoading } = useContext(AppContext);

  useEffect(() => {
    if (!isLoading) {
      loadFavoriteItems();
    }
  }, [isLoading]);

  const loadFavoriteItems = async () => {
    try {
      const dbFavoriteItems = await getCartItems();
      const favoritesWithFoodItems: FavoriteItem[] = [];
      
      for (const item of dbFavoriteItems) {
        const foodItem = await getFoodItemById(item.foodId);
        if (foodItem) {
          favoritesWithFoodItems.push({
            id: item.id,
            foodItem,
            quantity: 1 // Default to 1 for favorites
          });
        }
      }
      
      setCartItems(favoritesWithFoodItems);
    } catch (error) {
      console.error('Failed to load favorite items:', error);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Check if a food item is in favorites
  const isFavorite = (foodId: string) => {
    return cartItems.some(item => item.foodItem.id === foodId);
  };

  const addToCart = async (foodItem: FoodItemClient) => {
    try {
      // If item is already in favorites, don't add it again
      if (isFavorite(foodItem.id)) {
        openCart();
        return;
      }
      
      await addToCartDB(foodItem.id);
      await loadFavoriteItems();
      openCart();
    } catch (error) {
      console.error('Failed to add item to favorites:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await removeFromCartDB(id);
      await loadFavoriteItems();
    } catch (error) {
      console.error('Failed to remove item from favorites:', error);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartDB();
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      clearCart,
      isFavorite
    }}>
      {children}
    </CartContext.Provider>
  );
};
