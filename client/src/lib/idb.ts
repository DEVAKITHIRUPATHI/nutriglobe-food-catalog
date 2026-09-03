import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { FoodItemClient, CartItemClient, Language } from '@shared/schema';

export interface SearchHistoryItem {
  id: string;
  query: string;
  category?: string;
  timestamp: number;
  resultCount?: number;
}

export interface UserNutritionProfile {
  id: string;
  displayName: string;
  calorieTarget: number;
  proteinTarget: number; // in grams
  carbsTarget: number;   // in grams
  fatTarget: number;     // in grams
  fiberTarget: number;   // in grams
  dietaryFocus: 'balanced' | 'high-protein' | 'plant-based' | 'low-carb' | 'heart-health' | 'gut-health';
  healthGoals: string[];
  allergens: string[];
  updatedAt: number;
}

interface NutriGlobeDB extends DBSchema {
  foodItems: {
    key: string;
    value: FoodItemClient;
    indexes: { 'by-category': string[] };
  };
  cartItems: {
    key: string;
    value: {
      id: string;
      foodId: string;
      quantity: number;
    };
  };
  settings: {
    key: string;
    value: {
      language: Language;
      isOffline: boolean;
      lastSync: number;
    };
  };
  searchHistory: {
    key: string;
    value: SearchHistoryItem;
    indexes: { 'by-timestamp': number };
  };
  userNutritionProfile: {
    key: string;
    value: UserNutritionProfile;
  };
}

let db: IDBPDatabase<NutriGlobeDB> | null = null;
let isIDBAvailable = true;

// Helper to store in localStorage safely
function setLocalStorageItem(key: string, data: any) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`nutriglobe_${key}`, JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`localStorage quota or access error for ${key}:`, e);
  }
}

function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`nutriglobe_${key}`);
      if (stored) return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`localStorage read error for ${key}:`, e);
  }
  return defaultValue;
}

export async function initDB() {
  if (!isIDBAvailable) return null;
  try {
    db = await openDB<NutriGlobeDB>('nutriglobe-db', 2, {
      upgrade(database, oldVersion) {
        // Create food items store with category index
        if (!database.objectStoreNames.contains('foodItems')) {
          const foodStore = database.createObjectStore('foodItems', { keyPath: 'id' });
          foodStore.createIndex('by-category', 'category', { multiEntry: true });
        }

        // Create cart items store
        if (!database.objectStoreNames.contains('cartItems')) {
          database.createObjectStore('cartItems', { keyPath: 'id' });
        }

        // Create settings store
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' });
        }

        // Create searchHistory store
        if (!database.objectStoreNames.contains('searchHistory')) {
          const searchStore = database.createObjectStore('searchHistory', { keyPath: 'id' });
          searchStore.createIndex('by-timestamp', 'timestamp');
        }

        // Create userNutritionProfile store
        if (!database.objectStoreNames.contains('userNutritionProfile')) {
          database.createObjectStore('userNutritionProfile', { keyPath: 'id' });
        }
      },
    });
    return db;
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to LocalStorage:', error);
    isIDBAvailable = false;
    db = null;
    return null;
  }
}

export async function getDB() {
  if (!db && isIDBAvailable) {
    await initDB();
  }
  return db;
}

// Food item operations
export async function storeFoodItems(items: FoodItemClient[]) {
  // Always mirror to localStorage fallback
  setLocalStorageItem('foodItems', items);

  try {
    const database = await getDB();
    if (database) {
      const tx = database.transaction('foodItems', 'readwrite');
      await Promise.all(items.map(item => tx.store.put(item)));
      await tx.done;
    }
  } catch (err) {
    console.warn('Error storing food items in IDB, relying on localStorage:', err);
  }
}

export async function getFoodItems(): Promise<FoodItemClient[]> {
  try {
    const database = await getDB();
    if (database) {
      const items = await database.getAll('foodItems');
      if (items && items.length > 0) return items;
    }
  } catch (err) {
    console.warn('Error getting food items from IDB:', err);
  }
  return getLocalStorageItem<FoodItemClient[]>('foodItems', []);
}

export async function getFoodItemsByCategory(category: string): Promise<FoodItemClient[]> {
  try {
    const database = await getDB();
    if (database) {
      if (category === 'all') {
        return database.getAll('foodItems');
      }
      return database.getAllFromIndex('foodItems', 'by-category', category as any);
    }
  } catch (err) {
    console.warn('Error getting food items by category from IDB:', err);
  }

  const all = getLocalStorageItem<FoodItemClient[]>('foodItems', []);
  if (category === 'all') return all;
  return all.filter(item => Array.isArray(item.category) ? item.category.includes(category) : (item.category as any) === category);
}

export async function getFoodItemById(id: string): Promise<FoodItemClient | undefined> {
  try {
    const database = await getDB();
    if (database) {
      return database.get('foodItems', id);
    }
  } catch (err) {
    console.warn('Error getting food item by ID from IDB:', err);
  }

  const all = getLocalStorageItem<FoodItemClient[]>('foodItems', []);
  return all.find(item => item.id === id);
}

export async function searchFoodItems(query: string, category?: string): Promise<FoodItemClient[]> {
  let items: FoodItemClient[] = [];
  try {
    const database = await getDB();
    if (database) {
      if (category && category !== 'all') {
        items = await database.getAllFromIndex('foodItems', 'by-category', category as any);
      } else {
        items = await database.getAll('foodItems');
      }
    }
  } catch (err) {
    console.warn('Error searching food items from IDB:', err);
  }

  if (!items || items.length === 0) {
    items = getLocalStorageItem<FoodItemClient[]>('foodItems', []);
    if (category && category !== 'all') {
      items = items.filter(i => Array.isArray(i.category) ? i.category.includes(category) : (i.category as any) === category);
    }
  }

  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(item => {
    // Search in all available name translations
    const nameMatch = Object.values(item.name || {}).some(
      translation => translation && translation.toLowerCase().includes(lowerQuery)
    );
    
    // Search in all available description translations
    const descriptionMatch = Object.values(item.description || {}).some(
      translation => translation && translation.toLowerCase().includes(lowerQuery)
    );
    
    return nameMatch || descriptionMatch;
  });
}

// Cart operations
export async function getCartItems(): Promise<{ id: string; foodId: string; quantity: number }[]> {
  try {
    const database = await getDB();
    if (database) {
      return database.getAll('cartItems');
    }
  } catch (err) {
    console.warn('Error getting cart items from IDB:', err);
  }
  return getLocalStorageItem('cartItems', []);
}

export async function addToCart(foodId: string) {
  let updatedCart: { id: string; foodId: string; quantity: number }[] = [];
  try {
    const database = await getDB();
    if (database) {
      const tx = database.transaction('cartItems', 'readwrite');
      const existingItems = await tx.store.getAll();
      const existingItem = existingItems.find(item => item.foodId === foodId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        await tx.store.put(existingItem);
      } else {
        const newItem = {
          id: `cart-${Date.now()}`,
          foodId,
          quantity: 1
        };
        await tx.store.add(newItem);
      }
      await tx.done;
      updatedCart = await database.getAll('cartItems');
    }
  } catch (err) {
    console.warn('Error adding to cart in IDB:', err);
    const existing = getLocalStorageItem<{ id: string; foodId: string; quantity: number }[]>('cartItems', []);
    const item = existing.find(i => i.foodId === foodId);
    if (item) {
      item.quantity += 1;
      updatedCart = existing;
    } else {
      updatedCart = [...existing, { id: `cart-${Date.now()}`, foodId, quantity: 1 }];
    }
  }
  setLocalStorageItem('cartItems', updatedCart);
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  try {
    const database = await getDB();
    if (database) {
      const tx = database.transaction('cartItems', 'readwrite');
      const item = await tx.store.get(id);
      if (item) {
        item.quantity = quantity;
        await tx.store.put(item);
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('Error updating cart in IDB:', err);
  }
  const existing = getLocalStorageItem<{ id: string; foodId: string; quantity: number }[]>('cartItems', []);
  const updated = existing.map(i => i.id === id ? { ...i, quantity } : i);
  setLocalStorageItem('cartItems', updated);
}

export async function removeFromCart(id: string) {
  try {
    const database = await getDB();
    if (database) {
      await database.delete('cartItems', id);
    }
  } catch (err) {
    console.warn('Error removing from cart in IDB:', err);
  }
  const existing = getLocalStorageItem<{ id: string; foodId: string; quantity: number }[]>('cartItems', []);
  const updated = existing.filter(i => i.id !== id);
  setLocalStorageItem('cartItems', updated);
}

export async function clearCart() {
  try {
    const database = await getDB();
    if (database) {
      const tx = database.transaction('cartItems', 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  } catch (err) {
    console.warn('Error clearing cart in IDB:', err);
  }
  setLocalStorageItem('cartItems', []);
}

// Settings operations
export async function getSettings() {
  const fallbackSettings = {
    key: 'user-settings',
    language: 'en' as const,
    isOffline: false,
    lastSync: Date.now()
  };

  const local = getLocalStorageItem('settings', fallbackSettings);

  try {
    const database = await getDB();
    if (database) {
      const settings = await database.get('settings', 'user-settings');
      if (settings) return settings;
      await database.put('settings', local);
    }
  } catch (err) {
    console.warn('Error reading settings from IDB:', err);
  }
  return local;
}

export async function updateSettings(settings: {
  language?: Language;
  isOffline?: boolean;
  lastSync?: number;
}) {
  const currentSettings = await getSettings();
  const updatedSettings = {
    ...currentSettings,
    ...settings
  };

  // Always sync to LocalStorage fallback
  setLocalStorageItem('settings', updatedSettings);

  try {
    const database = await getDB();
    if (database) {
      await database.put('settings', updatedSettings);
    }
  } catch (err) {
    console.warn('Error writing settings to IDB:', err);
  }

  return updatedSettings;
}

// ---------------------------------------------------------------------------
// Search History Operations (Integrated with existing IDB/LocalStorage)
// ---------------------------------------------------------------------------

const DEFAULT_SEARCH_HISTORY_SEEDS: SearchHistoryItem[] = [
  {
    id: 'seed-search-1',
    query: 'Alphonso Mango',
    category: 'fruits',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    resultCount: 3
  },
  {
    id: 'seed-search-2',
    query: 'High Protein Lentils',
    category: 'legumes',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    resultCount: 8
  },
  {
    id: 'seed-search-3',
    query: 'Citrus Vitamin C',
    category: 'fruits',
    timestamp: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    resultCount: 12
  },
  {
    id: 'seed-search-4',
    query: 'Spinach Iron',
    category: 'vegetables',
    timestamp: Date.now() - 1000 * 60 * 60 * 28, // yesterday
    resultCount: 6
  }
];

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('searchHistory')) {
      const all = await database.getAll('searchHistory');
      if (all && all.length > 0) {
        return all.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
  } catch (err) {
    console.warn('Error reading search history from IDB:', err);
  }

  const localHistory = getLocalStorageItem<SearchHistoryItem[]>('searchHistory', []);
  if (localHistory && localHistory.length > 0) {
    return localHistory.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Seed with realistic initial data if completely empty
  setLocalStorageItem('searchHistory', DEFAULT_SEARCH_HISTORY_SEEDS);
  return DEFAULT_SEARCH_HISTORY_SEEDS;
}

export async function addSearchHistory(entry: {
  query: string;
  category?: string;
  resultCount?: number;
}): Promise<SearchHistoryItem> {
  const trimmed = entry.query ? entry.query.trim() : '';
  if (!trimmed && (!entry.category || entry.category === 'all')) {
    return {
      id: `sh-${Date.now()}`,
      query: '',
      category: 'all',
      timestamp: Date.now(),
      resultCount: entry.resultCount || 0
    };
  }

  const existing = await getSearchHistory();
  // Filter out exact duplicate recent queries
  const filtered = existing.filter(
    item => !(item.query.toLowerCase() === trimmed.toLowerCase() && (item.category || 'all') === (entry.category || 'all'))
  );

  const newItem: SearchHistoryItem = {
    id: `sh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    query: trimmed,
    category: entry.category || 'all',
    timestamp: Date.now(),
    resultCount: entry.resultCount || 0
  };

  const updatedHistory = [newItem, ...filtered].slice(0, 30); // keep last 30 searches
  setLocalStorageItem('searchHistory', updatedHistory);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('searchHistory')) {
      const tx = database.transaction('searchHistory', 'readwrite');
      await tx.store.put(newItem);
      await tx.done;
    }
  } catch (err) {
    console.warn('Error saving search history to IDB:', err);
  }

  return newItem;
}

export async function removeSearchHistoryItem(id: string): Promise<void> {
  const existing = await getSearchHistory();
  const updated = existing.filter(item => item.id !== id);
  setLocalStorageItem('searchHistory', updated);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('searchHistory')) {
      await database.delete('searchHistory', id);
    }
  } catch (err) {
    console.warn('Error deleting search history from IDB:', err);
  }
}

export async function clearSearchHistory(): Promise<void> {
  setLocalStorageItem('searchHistory', []);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('searchHistory')) {
      const tx = database.transaction('searchHistory', 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  } catch (err) {
    console.warn('Error clearing search history from IDB:', err);
  }
}

// ---------------------------------------------------------------------------
// Personalized User Nutrition Profile Operations
// ---------------------------------------------------------------------------

const DEFAULT_NUTRITION_PROFILE: UserNutritionProfile = {
  id: 'current-profile',
  displayName: 'Health Explorer',
  calorieTarget: 2000,
  proteinTarget: 75,
  carbsTarget: 250,
  fatTarget: 65,
  fiberTarget: 30,
  dietaryFocus: 'balanced',
  healthGoals: ['Maintain healthy energy', 'Improve gut microbiome', 'Boost cellular antioxidants'],
  allergens: [],
  updatedAt: Date.now()
};

export async function getUserNutritionProfile(): Promise<UserNutritionProfile> {
  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('userNutritionProfile')) {
      const profile = await database.get('userNutritionProfile', 'current-profile');
      if (profile) return profile;
    }
  } catch (err) {
    console.warn('Error reading user nutrition profile from IDB:', err);
  }

  const local = getLocalStorageItem<UserNutritionProfile>('userNutritionProfile', DEFAULT_NUTRITION_PROFILE);
  return local;
}

export async function updateUserNutritionProfile(
  updates: Partial<UserNutritionProfile>
): Promise<UserNutritionProfile> {
  const current = await getUserNutritionProfile();
  const updated: UserNutritionProfile = {
    ...current,
    ...updates,
    updatedAt: Date.now()
  };

  setLocalStorageItem('userNutritionProfile', updated);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('userNutritionProfile')) {
      await database.put('userNutritionProfile', updated);
    }
  } catch (err) {
    console.warn('Error saving user nutrition profile to IDB:', err);
  }

  return updated;
}

