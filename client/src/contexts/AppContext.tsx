import { createContext, useState, useEffect, ReactNode } from 'react';
import { initDB, getSettings, updateSettings, storeFoodItems } from '@/lib/idb';
import { foodItems } from '@shared/mockData';
import type { Language } from '@shared/schema';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import type { OfflineStatus } from '@/types';

interface AppContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  offlineStatus: OfflineStatus;
  toggleOfflineMode: () => void;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextProps>({
  language: 'en',
  setLanguage: () => {},
  offlineStatus: 'online',
  toggleOfflineMode: () => {},
  isLoading: true,
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
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

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Initialize IndexedDB with fallback protection
        await initDB();
        
        // Step 2: Load settings (checks IDB first, falls back to LocalStorage)
        const settings = await getSettings();
        if (settings?.language) {
          setLanguageState(settings.language as Language);
          try {
            localStorage.setItem('nutriglobe_language', settings.language);
          } catch (e) {}
        }
        
        // Step 3: Store food items in IndexedDB and LocalStorage fallback
        await storeFoodItems(foodItems);
      } catch (error) {
        console.error('AppProvider initialization warning (relying on LocalStorage fallback):', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

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

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      offlineStatus,
      toggleOfflineMode,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};
