import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { initDB, getSettings, updateSettings, storeFoodItems, getFoodItems } from '@/lib/idb';
import type { Language, FoodItemClient } from '@shared/schema';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import type { OfflineStatus } from '@/types';

interface AppContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  offlineStatus: OfflineStatus;
  toggleOfflineMode: () => void;
  isLoading: boolean;
  foods: FoodItemClient[];
  refreshFoods: () => Promise<void>;
  addFoodItem: (food: FoodItemClient) => Promise<FoodItemClient>;
  updateFoodItem: (id: string, updates: Partial<FoodItemClient>) => Promise<FoodItemClient | null>;
  deleteFoodItem: (id: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextProps>({
  language: 'en',
  setLanguage: () => {},
  offlineStatus: 'online',
  toggleOfflineMode: () => {},
  isLoading: true,
  foods: [],
  refreshFoods: async () => {},
  addFoodItem: async (food) => food,
  updateFoodItem: async () => null,
  deleteFoodItem: async () => false,
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [foods, setFoods] = useState<FoodItemClient[]>([]);
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('nutriglobe_language');
        if (saved) return saved as Language;
      }
    } catch (e) {
      console.warn('localStorage read error for language:', e);
    }
    return 'en';
  });

  const [isLoading, setIsLoading] = useState(true);
  const { status: offlineStatus, toggleOfflineMode } = useOfflineDetection();

  // Fetch foods from API or fallback
  const refreshFoods = useCallback(async () => {
    try {
      const res = await fetch('/api/foods');
      if (res.ok) {
        const items: FoodItemClient[] = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          setFoods(items);
          await storeFoodItems(items);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch foods from server, attempting IDB fallback:', e);
    }

    try {
      const idbItems = await getFoodItems();
      if (idbItems && idbItems.length > 0) {
        setFoods(idbItems);
      } else {
        const { foodItems: fallbackFoods } = await import('@shared/mockData');
        setFoods([...fallbackFoods]);
        await storeFoodItems(fallbackFoods);
      }
    } catch (err) {
      try {
        const { foodItems: fallbackFoods } = await import('@shared/mockData');
        setFoods([...fallbackFoods]);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        
        const settings = await getSettings();
        if (settings?.language) {
          setLanguageState(settings.language as Language);
          try {
            localStorage.setItem('nutriglobe_language', settings.language);
          } catch (e) {}
        }

        await refreshFoods();
      } catch (error) {
        console.error('AppProvider initialization warning:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [refreshFoods]);

  // Synchronize HTML lang and writing direction (LTR/RTL) across all 45+ languages
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      const isRtl = ['ar', 'ur', 'fa', 'sd', 'ks'].includes(language);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('nutriglobe_language', lang);
      }
    } catch (e) {
      console.warn('localStorage setItem error:', e);
    }
    await updateSettings({ language: lang });
  };

  // Add Food Item - Instant Context Sync
  const addFoodItem = async (newFood: FoodItemClient): Promise<FoodItemClient> => {
    // 1. Instantly update React context state
    setFoods((prev) => [newFood, ...prev.filter((f) => f.id !== newFood.id)]);

    // 2. Persist to API
    try {
      const res = await fetch('/api/admin/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.food) {
          setFoods((prev) => [data.food, ...prev.filter((f) => f.id !== data.food.id)]);
          await storeFoodItems([data.food]);
          return data.food;
        }
      }
    } catch (err) {
      console.error('API save failed, retaining in local context:', err);
    }

    await storeFoodItems([newFood]);
    return newFood;
  };

  // Update Food Item - Instant Context Sync
  const updateFoodItem = async (id: string, updates: Partial<FoodItemClient>): Promise<FoodItemClient | null> => {
    let updatedObj: FoodItemClient | null = null;

    // 1. Instantly update React context state
    setFoods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedObj = { ...item, ...updates };
          return updatedObj;
        }
        return item;
      })
    );

    // 2. Persist to API
    try {
      const res = await fetch(`/api/admin/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.food) {
          updatedObj = data.food;
          setFoods((prev) => prev.map((item) => (item.id === id ? data.food : item)));
          await storeFoodItems([data.food]);
          return data.food;
        }
      }
    } catch (err) {
      console.error('API update failed, retaining in local context:', err);
    }

    if (updatedObj) {
      await storeFoodItems([updatedObj]);
    }
    return updatedObj;
  };

  // Delete Food Item - Instant Context Sync
  const deleteFoodItem = async (id: string): Promise<boolean> => {
    // 1. Instantly update React context state
    setFoods((prev) => prev.filter((item) => item.id !== id));

    // 2. Persist to API
    try {
      const res = await fetch(`/api/admin/foods/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.error('API delete error:', err);
    }
    return true;
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      offlineStatus,
      toggleOfflineMode,
      isLoading,
      foods,
      refreshFoods,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

