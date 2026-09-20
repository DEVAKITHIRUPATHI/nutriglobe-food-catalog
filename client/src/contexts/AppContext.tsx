import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { initDB, getSettings, updateSettings, storeFoodItems, getFoodItems } from '@/lib/idb';
import type { Language, FoodItemClient } from '@shared/schema';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import type { OfflineStatus } from '@/types';
import { 
  synchronizeFoodData, 
  getLastSyncStats, 
  queueFoodMutation, 
  type SyncStats 
} from '@/lib/syncService';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
export type SyncStage = 'checking' | 'uploading' | 'downloading' | 'persisting' | null;

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
  // Reconnection synchronization properties
  syncStatus: SyncState;
  syncStage: SyncStage;
  lastSyncStats: SyncStats | null;
  triggerSync: () => Promise<SyncStats>;
  dismissSyncNotification: () => void;
  showSyncBanner: boolean;
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
  syncStatus: 'idle',
  syncStage: null,
  lastSyncStats: null,
  triggerSync: async () => ({
    success: true,
    syncedCount: 0,
    pendingAppliedCount: 0,
    timestamp: Date.now(),
    durationMs: 0,
    database: 'connected'
  }),
  dismissSyncNotification: () => {},
  showSyncBanner: false,
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

  // Reconnection synchronization states
  const [syncStatus, setSyncStatus] = useState<SyncState>('idle');
  const [syncStage, setSyncStage] = useState<SyncStage>(null);
  const [lastSyncStats, setLastSyncStats] = useState<SyncStats | null>(() => getLastSyncStats());
  const [showSyncBanner, setShowSyncBanner] = useState<boolean>(false);
  const previousOfflineStatus = useRef<OfflineStatus>(offlineStatus);
  const autoDismissTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Reconnection synchronization handler
  const triggerSync = useCallback(async (): Promise<SyncStats> => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }

    setSyncStatus('syncing');
    setShowSyncBanner(true);

    try {
      const stats = await synchronizeFoodData((stage) => {
        setSyncStage(stage);
      });

      setLastSyncStats(stats);

      if (stats.success) {
        setSyncStatus('synced');
        // Refresh context foods with freshly synchronized records
        const freshItems = await getFoodItems();
        if (freshItems && freshItems.length > 0) {
          setFoods(freshItems);
        }

        // Auto-dismiss banner after 7 seconds
        autoDismissTimer.current = setTimeout(() => {
          setShowSyncBanner(false);
          setSyncStatus('idle');
        }, 7000);
      } else {
        setSyncStatus('error');
      }

      return stats;
    } catch (e: any) {
      console.warn('Sync execution error:', e);
      setSyncStatus('error');
      const fallback: SyncStats = {
        success: false,
        syncedCount: foods.length,
        pendingAppliedCount: 0,
        timestamp: Date.now(),
        durationMs: 0,
        database: 'error',
        errorMessage: e?.message || 'Sync failed'
      };
      return fallback;
    } finally {
      setSyncStage(null);
    }
  }, [foods.length]);

  const dismissSyncNotification = useCallback(() => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    setShowSyncBanner(false);
    setSyncStatus('idle');
  }, []);

  // Automatic Reconnection Detector:
  // Detects when app transitions from offline to online and triggers sync
  useEffect(() => {
    if (previousOfflineStatus.current === 'offline' && offlineStatus === 'online') {
      console.log('Reconnection detected: Triggering automatic synchronization of offline-cached food data...');
      triggerSync();
    } else if (offlineStatus === 'offline') {
      // Hide sync success banner when going offline
      setShowSyncBanner(false);
      setSyncStatus('idle');
    }
    previousOfflineStatus.current = offlineStatus;
  }, [offlineStatus, triggerSync]);

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

    // 2. Persist to API or queue if offline
    if (offlineStatus === 'offline') {
      queueFoodMutation({ type: 'add', food: newFood });
    } else {
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
        console.warn('API save failed while attempting online persist, queueing for reconnection sync:', err);
        queueFoodMutation({ type: 'add', food: newFood });
      }
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

    // 2. Persist to API or queue if offline
    if (updatedObj) {
      const foodToSave: FoodItemClient = updatedObj;
      if (offlineStatus === 'offline') {
        queueFoodMutation({ type: 'update', food: foodToSave });
      } else {
        try {
          const res = await fetch(`/api/admin/foods/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.food) {
              setFoods((prev) => prev.map((item) => (item.id === id ? data.food : item)));
              await storeFoodItems([data.food]);
              return data.food;
            }
          }
        } catch (err) {
          console.warn('API update failed, queueing for reconnection sync:', err);
          queueFoodMutation({ type: 'update', food: foodToSave });
        }
      }

      await storeFoodItems([foodToSave]);
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
      deleteFoodItem,
      syncStatus,
      syncStage,
      lastSyncStats,
      triggerSync,
      dismissSyncNotification,
      showSyncBanner
    }}>
      {children}
    </AppContext.Provider>
  );
};

