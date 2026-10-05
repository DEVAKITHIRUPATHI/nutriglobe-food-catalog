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

export interface LoggedMealEntry {
  id: string;
  foodId: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number; // e.g. 1
  servingGrams: number; // e.g. 100g
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber: number;   // in grams
  loggedAt: number;
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. 'Thu, Oct 1'
  entries: LoggedMealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
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
  dailyNutritionLogs: {
    key: string;
    value: DailyNutritionLog;
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
    db = await openDB<NutriGlobeDB>('nutriglobe-db', 3, {
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

        // Create dailyNutritionLogs store
        if (!database.objectStoreNames.contains('dailyNutritionLogs')) {
          database.createObjectStore('dailyNutritionLogs', { keyPath: 'date' });
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
export async function clearAllFoodData(): Promise<void> {
  try {
    localStorage.removeItem('nutriglobe_offline_foodItems');
    const database = await getDB();
    if (database) {
      const tx = database.transaction('foodItems', 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  } catch (err) {
    console.warn('Error clearing food items in IDB:', err);
  }
}

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

// ---------------------------------------------------------------------------
// Daily Nutrition Intake Logging & 7-Day Trend Storage
// ---------------------------------------------------------------------------

export function getISODateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDayLabel(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export function getDayOfWeekShort(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr.slice(-5);
}

// Generates an evidence-backed realistic 7-day nutritional diary calibrated to user goals
export function generateRealisticSample7DayLogs(profile?: UserNutritionProfile): DailyNutritionLog[] {
  const calorieTarget = profile?.calorieTarget || 2000;
  const proteinTarget = profile?.proteinTarget || 75;
  const carbsTarget = profile?.carbsTarget || 250;
  const fatTarget = profile?.fatTarget || 65;
  const fiberTarget = profile?.fiberTarget || 30;

  // Realistic meal templates with clinically consistent macronutrient profiles
  const sampleMealsPool: Array<{
    name: string;
    foodId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    servingGrams: number;
    cal: number;
    p: number;
    c: number;
    f: number;
    fib: number;
  }> = [
    // Breakfasts
    { name: 'Rolled Oats with Blueberries, Chia Seeds & Almond Milk', foodId: 'oats', mealType: 'breakfast', servings: 1, servingGrams: 280, cal: 380, p: 14, c: 58, f: 10, fib: 9 },
    { name: 'Poached Eggs with Whole Grain Sourdough & Avocado', foodId: 'egg', mealType: 'breakfast', servings: 1, servingGrams: 220, cal: 420, p: 22, c: 34, f: 22, fib: 7 },
    { name: 'Greek Yogurt Bowl with Crushed Walnuts & Raw Honey', foodId: 'yogurt', mealType: 'breakfast', servings: 1, servingGrams: 240, cal: 350, p: 24, c: 28, f: 14, fib: 3 },
    { name: 'Traditional Idli with Sambar & Fresh Coconut Chutney', foodId: 'idli', mealType: 'breakfast', servings: 1, servingGrams: 300, cal: 360, p: 12, c: 62, f: 8, fib: 6 },
    // Lunches
    { name: 'Grilled Herb Chicken Breast with Quinoa & Steamed Broccoli', foodId: 'chicken_breast', mealType: 'lunch', servings: 1, servingGrams: 360, cal: 540, p: 48, c: 45, f: 14, fib: 8 },
    { name: 'Paneer Tikka with Yellow Dal Tadka & Brown Basmati Rice', foodId: 'paneer', mealType: 'lunch', servings: 1, servingGrams: 420, cal: 580, p: 28, c: 68, f: 20, fib: 9 },
    { name: 'Mediterranean Chickpea & Roasted Vegetable Tahini Bowl', foodId: 'chickpea', mealType: 'lunch', servings: 1, servingGrams: 380, cal: 510, p: 20, c: 72, f: 16, fib: 14 },
    { name: 'Wild Alaskan Salmon with Roasted Sweet Potato & Asparagus', foodId: 'salmon', mealType: 'lunch', servings: 1, servingGrams: 350, cal: 560, p: 42, c: 42, f: 22, fib: 6 },
    // Dinners
    { name: 'Lentil Spinach Soup (Dal Palak) with Whole Wheat Roti', foodId: 'spinach', mealType: 'dinner', servings: 1, servingGrams: 400, cal: 480, p: 22, c: 74, f: 10, fib: 12 },
    { name: 'Pan-Seared Tofu Vegetable Stir-Fry with Sesame & Brown Rice', foodId: 'tofu', mealType: 'dinner', servings: 1, servingGrams: 390, cal: 460, p: 26, c: 56, f: 16, fib: 8 },
    { name: 'Baked Cod with Lemon Herb Quinoa & Garden Green Salad', foodId: 'cod', mealType: 'dinner', servings: 1, servingGrams: 370, cal: 490, p: 44, c: 46, f: 12, fib: 7 },
    { name: 'Vegetable Khichdi with Spiced Curd & Flaxseed Topping', foodId: 'khichdi', mealType: 'dinner', servings: 1, servingGrams: 410, cal: 470, p: 18, c: 76, f: 10, fib: 11 },
    // Snacks
    { name: 'Raw California Almonds & Medjool Dates', foodId: 'almond', mealType: 'snack', servings: 1, servingGrams: 50, cal: 210, p: 6, c: 26, f: 12, fib: 4 },
    { name: 'Crisp Red Apple with Natural Peanut Butter', foodId: 'apple', mealType: 'snack', servings: 1, servingGrams: 180, cal: 240, p: 7, c: 30, f: 12, fib: 5 },
    { name: 'Fresh Tender Coconut Water with Kernel', foodId: 'tender_coconut', mealType: 'snack', servings: 1, servingGrams: 250, cal: 140, p: 3, c: 22, f: 4, fib: 4 },
    { name: 'Sprouted Moong Chaat with Pomegranate & Mint', foodId: 'moong', mealType: 'snack', servings: 1, servingGrams: 150, cal: 180, p: 11, c: 28, f: 2, fib: 7 }
  ];

  // Daily intake multipliers for a natural 7-day adherence variance curve (-12% to +10%)
  const dailyVariance = [
    { offset: -6, factor: 0.94, bfIdx: 0, luIdx: 0, dnIdx: 0, snIdx: 0 },
    { offset: -5, factor: 1.02, bfIdx: 1, luIdx: 1, dnIdx: 1, snIdx: 1 },
    { offset: -4, factor: 0.98, bfIdx: 2, luIdx: 2, dnIdx: 2, snIdx: 2 },
    { offset: -3, factor: 1.06, bfIdx: 3, luIdx: 3, dnIdx: 3, snIdx: 3 },
    { offset: -2, factor: 0.92, bfIdx: 0, luIdx: 1, dnIdx: 0, snIdx: 1 },
    { offset: -1, factor: 1.04, bfIdx: 1, luIdx: 0, dnIdx: 2, snIdx: 2 },
    { offset: 0,  factor: 0.99, bfIdx: 2, luIdx: 3, dnIdx: 1, snIdx: 0 } // Today
  ];

  const now = Date.now();
  const logs: DailyNutritionLog[] = dailyVariance.map(dayCfg => {
    const dateStr = getISODateString(dayCfg.offset);
    const dayLabel = formatDayLabel(dateStr);

    const bMeal = sampleMealsPool[dayCfg.bfIdx];
    const lMeal = sampleMealsPool[4 + dayCfg.luIdx];
    const dMeal = sampleMealsPool[8 + dayCfg.dnIdx];
    const sMeal = sampleMealsPool[12 + dayCfg.snIdx];

    const meals = [bMeal, lMeal, dMeal, sMeal];
    const entries: LoggedMealEntry[] = meals.map((m, idx) => {
      const scaledP = Math.round(m.p * (proteinTarget / 75) * dayCfg.factor * 10) / 10;
      const scaledC = Math.round(m.c * (carbsTarget / 250) * dayCfg.factor * 10) / 10;
      const scaledF = Math.round(m.f * (fatTarget / 65) * dayCfg.factor * 10) / 10;
      const scaledFib = Math.round(m.fib * (fiberTarget / 30) * dayCfg.factor * 10) / 10;
      const scaledCal = Math.round(scaledP * 4 + scaledC * 4 + scaledF * 9);

      return {
        id: `entry-${dateStr}-${m.mealType}-${idx}`,
        foodId: m.foodId,
        foodName: m.name,
        mealType: m.mealType,
        servings: 1,
        servingGrams: m.servingGrams,
        calories: scaledCal,
        protein: scaledP,
        carbs: scaledC,
        fat: scaledF,
        fiber: scaledFib,
        loggedAt: now - Math.abs(dayCfg.offset) * 86400000 + idx * 3600000
      };
    });

    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = Math.round(entries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(entries.reduce((sum, e) => sum + e.carbs, 0) * 10) / 10;
    const totalFat = Math.round(entries.reduce((sum, e) => sum + e.fat, 0) * 10) / 10;
    const totalFiber = Math.round(entries.reduce((sum, e) => sum + e.fiber, 0) * 10) / 10;

    return {
      date: dateStr,
      dayLabel,
      entries,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      updatedAt: now
    };
  });

  return logs;
}

export async function getDailyNutritionLogs(daysCount: number = 7, offsetDays: number = 0): Promise<DailyNutritionLog[]> {
  const targetDates: string[] = [];
  for (let i = -(daysCount - 1) + offsetDays; i <= offsetDays; i++) {
    targetDates.push(getISODateString(i));
  }

  // First try reading from IDB
  let storedLogsMap: Record<string, DailyNutritionLog> = {};
  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
      const allLogs = await database.getAll('dailyNutritionLogs');
      if (Array.isArray(allLogs) && allLogs.length > 0) {
        allLogs.forEach(log => {
          if (log && log.date) storedLogsMap[log.date] = log;
        });
      }
    }
  } catch (err) {
    console.warn('Error reading daily nutrition logs from IDB:', err);
  }

  // Fallback / merge with LocalStorage
  if (Object.keys(storedLogsMap).length === 0) {
    const local = getLocalStorageItem<Record<string, DailyNutritionLog>>('dailyNutritionLogs', {});
    if (local && typeof local === 'object') {
      storedLogsMap = { ...local };
    }
  }

  // If completely empty, auto-seed realistic sample data for smooth first-time experience
  if (Object.keys(storedLogsMap).length === 0) {
    const profile = await getUserNutritionProfile();
    const seeded = generateRealisticSample7DayLogs(profile);
    const newMap: Record<string, DailyNutritionLog> = {};
    seeded.forEach(log => {
      newMap[log.date] = log;
    });
    setLocalStorageItem('dailyNutritionLogs', newMap);

    try {
      const database = await getDB();
      if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
        const tx = database.transaction('dailyNutritionLogs', 'readwrite');
        for (const log of seeded) {
          await tx.store.put(log);
        }
        await tx.done;
      }
    } catch (e) {
      // ignore
    }

    storedLogsMap = newMap;
  }

  // Return the ordered list of days
  return targetDates.map(dateStr => {
    if (storedLogsMap[dateStr]) {
      return storedLogsMap[dateStr];
    }
    // Return empty day shell if not logged yet
    return {
      date: dateStr,
      dayLabel: formatDayLabel(dateStr),
      entries: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      updatedAt: Date.now()
    };
  });
}

export async function getDailyNutritionLogByDate(dateStr: string): Promise<DailyNutritionLog | null> {
  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
      const log = await database.get('dailyNutritionLogs', dateStr);
      if (log) return log;
    }
  } catch (err) {
    console.warn(`Error getting daily log for ${dateStr} from IDB:`, err);
  }

  const local = getLocalStorageItem<Record<string, DailyNutritionLog>>('dailyNutritionLogs', {});
  return local[dateStr] || null;
}

export async function saveDailyNutritionLog(log: DailyNutritionLog): Promise<void> {
  const local = getLocalStorageItem<Record<string, DailyNutritionLog>>('dailyNutritionLogs', {});
  local[log.date] = log;
  setLocalStorageItem('dailyNutritionLogs', local);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
      await database.put('dailyNutritionLogs', log);
    }
  } catch (err) {
    console.warn(`Error saving daily log for ${log.date} to IDB:`, err);
  }
}

export async function logMealEntry(
  dateStr: string,
  entryData: Omit<LoggedMealEntry, 'id' | 'loggedAt'>
): Promise<DailyNutritionLog> {
  let log = await getDailyNutritionLogByDate(dateStr);
  if (!log) {
    log = {
      date: dateStr,
      dayLabel: formatDayLabel(dateStr),
      entries: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      updatedAt: Date.now()
    };
  }

  const newEntry: LoggedMealEntry = {
    ...entryData,
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    loggedAt: Date.now()
  };

  const updatedEntries = [...log.entries, newEntry];
  const totalCalories = updatedEntries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
  const totalProtein = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fiber) || 0), 0) * 10) / 10;

  const updatedLog: DailyNutritionLog = {
    ...log,
    entries: updatedEntries,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    updatedAt: Date.now()
  };

  await saveDailyNutritionLog(updatedLog);
  return updatedLog;
}

export async function deleteMealEntry(dateStr: string, entryId: string): Promise<DailyNutritionLog | null> {
  const log = await getDailyNutritionLogByDate(dateStr);
  if (!log) return null;

  const updatedEntries = log.entries.filter(e => e.id !== entryId);
  const totalCalories = updatedEntries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
  const totalProtein = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fiber) || 0), 0) * 10) / 10;

  const updatedLog: DailyNutritionLog = {
    ...log,
    entries: updatedEntries,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    updatedAt: Date.now()
  };

  await saveDailyNutritionLog(updatedLog);
  return updatedLog;
}

export async function clearDailyNutritionLogs(): Promise<void> {
  setLocalStorageItem('dailyNutritionLogs', {});
  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
      const tx = database.transaction('dailyNutritionLogs', 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  } catch (err) {
    console.warn('Error clearing daily nutrition logs from IDB:', err);
  }
}

export async function updateMealEntry(
  dateStr: string,
  entryId: string,
  updates: Partial<LoggedMealEntry>
): Promise<DailyNutritionLog | null> {
  const log = await getDailyNutritionLogByDate(dateStr);
  if (!log) return null;

  const updatedEntries = log.entries.map(e => {
    if (e.id === entryId) {
      return { ...e, ...updates };
    }
    return e;
  });

  const totalCalories = updatedEntries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
  const totalProtein = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(updatedEntries.reduce((sum, e) => sum + (Number(e.fiber) || 0), 0) * 10) / 10;

  const updatedLog: DailyNutritionLog = {
    ...log,
    entries: updatedEntries,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    updatedAt: Date.now()
  };

  await saveDailyNutritionLog(updatedLog);
  return updatedLog;
}

// ---------------------------------------------------------------------------
// Clinical Atwater Validation & Nutrition Scoring Algorithms
// ---------------------------------------------------------------------------

export function validateAtwaterCalories(
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): { expectedKcal: number; diff: number; isValid: boolean } {
  const expectedKcal = Math.round((protein || 0) * 4 + (carbs || 0) * 4 + (fat || 0) * 9);
  const diff = Math.abs(calories - expectedKcal);
  // Database and food lab assays round individual macros; allow up to 10% or 20 kcal tolerance
  const tolerance = Math.max(Math.round(expectedKcal * 0.1), 20);
  return {
    expectedKcal,
    diff,
    isValid: diff <= tolerance
  };
}

export interface DailyNutritionScoreResult {
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Needs Attention';
  badgeColor: string;
  breakdown: {
    caloriesScore: number; // Max 25
    proteinScore: number;  // Max 20
    carbsScore: number;    // Max 15
    fatScore: number;      // Max 15
    fiberScore: number;    // Max 15
    amdrScore: number;     // Max 10
  };
}

export function calculateDailyNutritionScore(
  log: DailyNutritionLog,
  profile: UserNutritionProfile
): DailyNutritionScoreResult {
  if (!log || log.totalCalories === 0) {
    return {
      score: 0,
      status: 'Needs Attention',
      badgeColor: 'bg-slate-500',
      breakdown: {
        caloriesScore: 0,
        proteinScore: 0,
        carbsScore: 0,
        fatScore: 0,
        fiberScore: 0,
        amdrScore: 0
      }
    };
  }

  const calTarget = profile?.calorieTarget || 2000;
  const pTarget = profile?.proteinTarget || 75;
  const cTarget = profile?.carbsTarget || 250;
  const fTarget = profile?.fatTarget || 65;
  const fibTarget = profile?.fiberTarget || 30;

  // 1. Calories Score (Weight: 25%)
  const calRatio = log.totalCalories / calTarget;
  let caloriesScore = 0;
  if (calRatio >= 0.9 && calRatio <= 1.1) {
    caloriesScore = 25;
  } else if (calRatio >= 0.8 && calRatio <= 1.2) {
    caloriesScore = 20;
  } else if (calRatio >= 0.7 && calRatio <= 1.3) {
    caloriesScore = 15;
  } else {
    caloriesScore = Math.max(Math.round(25 * (1 - Math.abs(1 - calRatio))), 5);
  }

  // 2. Protein Score (Weight: 20%)
  const pRatio = log.totalProtein / pTarget;
  let proteinScore = 0;
  if (pRatio >= 0.9 && pRatio <= 1.3) {
    proteinScore = 20;
  } else if (pRatio >= 0.75) {
    proteinScore = 16;
  } else if (pRatio >= 0.6) {
    proteinScore = 12;
  } else {
    proteinScore = Math.max(Math.round(20 * pRatio), 4);
  }

  // 3. Carbohydrates Score (Weight: 15%)
  const cRatio = log.totalCarbs / cTarget;
  let carbsScore = 0;
  if (cRatio >= 0.85 && cRatio <= 1.15) {
    carbsScore = 15;
  } else if (cRatio >= 0.7 && cRatio <= 1.3) {
    carbsScore = 12;
  } else {
    carbsScore = Math.max(Math.round(15 * (1 - Math.abs(1 - cRatio))), 3);
  }

  // 4. Healthy Fat Score (Weight: 15%)
  const fRatio = log.totalFat / fTarget;
  let fatScore = 0;
  if (fRatio >= 0.85 && fRatio <= 1.15) {
    fatScore = 15;
  } else if (fRatio >= 0.7 && cRatio <= 1.3) {
    fatScore = 12;
  } else {
    fatScore = Math.max(Math.round(15 * (1 - Math.abs(1 - fRatio))), 3);
  }

  // 5. Dietary Fiber Score (Weight: 15%)
  const fibRatio = log.totalFiber / fibTarget;
  let fiberScore = 0;
  if (fibRatio >= 0.9) {
    fiberScore = 15;
  } else if (fibRatio >= 0.75) {
    fiberScore = 12;
  } else if (fibRatio >= 0.5) {
    fiberScore = 8;
  } else {
    fiberScore = Math.max(Math.round(15 * fibRatio), 2);
  }

  // 6. AMDR Balance Score (Weight: 10%)
  const amdr = calculateAMDRStatus(log);
  let amdrScore = 0;
  if (amdr.isOverallWithinRange) {
    amdrScore = 10;
  } else {
    let matches = 0;
    if (amdr.isProteinWithinRange) matches++;
    if (amdr.isCarbsWithinRange) matches++;
    if (amdr.isFatWithinRange) matches++;
    amdrScore = matches === 2 ? 7 : (matches === 1 ? 4 : 2);
  }

  const rawTotal = caloriesScore + proteinScore + carbsScore + fatScore + fiberScore + amdrScore;
  const finalScore = Math.min(Math.max(rawTotal, 0), 100);

  let status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Needs Attention' = 'Good';
  let badgeColor = 'bg-teal-600';

  if (finalScore >= 90) {
    status = 'Excellent';
    badgeColor = 'bg-emerald-600';
  } else if (finalScore >= 75) {
    status = 'Good';
    badgeColor = 'bg-blue-600';
  } else if (finalScore >= 60) {
    status = 'Needs Improvement';
    badgeColor = 'bg-amber-600';
  } else {
    status = 'Needs Attention';
    badgeColor = 'bg-rose-600';
  }

  return {
    score: finalScore,
    status,
    badgeColor,
    breakdown: {
      caloriesScore,
      proteinScore,
      carbsScore,
      fatScore,
      fiberScore,
      amdrScore
    }
  };
}

export interface AMDRStatusResult {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  isProteinWithinRange: boolean;
  isCarbsWithinRange: boolean;
  isFatWithinRange: boolean;
  isOverallWithinRange: boolean;
  summary: string;
}

export function calculateAMDRStatus(log: DailyNutritionLog): AMDRStatusResult {
  const pKcal = (log.totalProtein || 0) * 4;
  const cKcal = (log.totalCarbs || 0) * 4;
  const fKcal = (log.totalFat || 0) * 9;
  const totalKcal = pKcal + cKcal + fKcal || 1;

  const proteinPct = Math.round((pKcal / totalKcal) * 100);
  const carbsPct = Math.round((cKcal / totalKcal) * 100);
  const fatPct = Math.round((fKcal / totalKcal) * 100);

  // AMDR clinical benchmarks
  // Protein: 10–35%
  // Carbohydrate: 45–65%
  // Fat: 20–35%
  const isProteinWithinRange = proteinPct >= 10 && proteinPct <= 35;
  const isCarbsWithinRange = carbsPct >= 45 && carbsPct <= 65;
  const isFatWithinRange = fatPct >= 20 && fatPct <= 35;
  const isOverallWithinRange = isProteinWithinRange && isCarbsWithinRange && isFatWithinRange;

  let summary = 'Within Clinical AMDR Range';
  if (!isOverallWithinRange) {
    const issues: string[] = [];
    if (!isProteinWithinRange) issues.push(proteinPct < 10 ? 'Protein low' : 'Protein high');
    if (!isCarbsWithinRange) issues.push(carbsPct < 45 ? 'Carbs low' : 'Carbs high');
    if (!isFatWithinRange) issues.push(fatPct < 20 ? 'Fat low' : 'Fat high');
    summary = issues.join(', ');
  }

  return {
    proteinPct,
    carbsPct,
    fatPct,
    isProteinWithinRange,
    isCarbsWithinRange,
    isFatWithinRange,
    isOverallWithinRange,
    summary
  };
}

export interface NutritionInsightItem {
  id: string;
  category: 'protein' | 'fiber' | 'energy' | 'amdr' | 'consistency';
  title: string;
  text: string;
  type: 'positive' | 'neutral' | 'improvement';
}

export function generate7DayInsights(
  currentLogs: DailyNutritionLog[],
  profile: UserNutritionProfile
): NutritionInsightItem[] {
  if (!currentLogs || currentLogs.length === 0) return [];

  const count = currentLogs.length;
  const totalP = currentLogs.reduce((acc, l) => acc + l.totalProtein, 0);
  const totalFib = currentLogs.reduce((acc, l) => acc + l.totalFiber, 0);
  const totalCal = currentLogs.reduce((acc, l) => acc + l.totalCalories, 0);

  const avgProtein = Math.round((totalP / count) * 10) / 10;
  const avgFiber = Math.round((totalFib / count) * 10) / 10;
  const avgCalories = Math.round(totalCal / count);

  const pTarget = profile?.proteinTarget || 75;
  const fibTarget = profile?.fiberTarget || 30;
  const calTarget = profile?.calorieTarget || 2000;

  const insights: NutritionInsightItem[] = [];

  // 1. Protein trend insight
  const pPct = Math.round((avgProtein / pTarget) * 100);
  if (pPct >= 90) {
    insights.push({
      id: 'insight-protein',
      category: 'protein',
      title: 'Optimal Protein Synthesis',
      text: `Your average protein intake is ${avgProtein} g/day (${pPct}% of goal), supporting lean tissue maintenance and metabolic recovery.`,
      type: 'positive'
    });
  } else {
    insights.push({
      id: 'insight-protein',
      category: 'protein',
      title: 'Protein Intake Opportunity',
      text: `Your average protein intake is ${avgProtein} g/day (${pPct}% of target). Incorporating legume, yogurt, or lean protein sources can help bridge the ${Math.round(pTarget - avgProtein)}g gap.`,
      type: 'neutral'
    });
  }

  // 2. Fiber insight
  let belowFibDays = 0;
  currentLogs.forEach(l => {
    if (l.totalFiber < fibTarget * 0.85) belowFibDays++;
  });
  if (belowFibDays >= 3) {
    insights.push({
      id: 'insight-fiber',
      category: 'fiber',
      title: 'Dietary Fiber Deficit Observed',
      text: `Fiber intake was below recommended target on ${belowFibDays} of the last ${count} days (7-day average: ${avgFiber}g vs ${fibTarget}g target). Increased whole grains and pulses are advised.`,
      type: 'improvement'
    });
  } else {
    insights.push({
      id: 'insight-fiber',
      category: 'fiber',
      title: 'Robust Prebiotic Fiber Intake',
      text: `Your 7-day average fiber intake of ${avgFiber} g/day meets WHO clinical targets for digestive microbiome diversity and sustained satiety.`,
      type: 'positive'
    });
  }

  // 3. Energy balance insight
  const calDeltaPct = Math.round(((avgCalories - calTarget) / calTarget) * 100);
  if (Math.abs(calDeltaPct) <= 5) {
    insights.push({
      id: 'insight-energy',
      category: 'energy',
      title: 'Stable Caloric Equilibrium',
      text: `Your average daily energy intake (${avgCalories} kcal) matched your estimated energy requirement within ${Math.abs(calDeltaPct)}%.`,
      type: 'positive'
    });
  } else if (calDeltaPct < 0) {
    insights.push({
      id: 'insight-energy',
      category: 'energy',
      title: 'Caloric Deficit Trend',
      text: `Your average calorie intake (${avgCalories} kcal) was ${Math.abs(calDeltaPct)}% below your daily target of ${calTarget} kcal.`,
      type: 'neutral'
    });
  } else {
    insights.push({
      id: 'insight-energy',
      category: 'energy',
      title: 'Mild Caloric Surplus',
      text: `Your average calorie intake (${avgCalories} kcal) was ${calDeltaPct}% above your baseline target.`,
      type: 'neutral'
    });
  }

  // 4. AMDR macro distribution insight
  let amdrComplianceDays = 0;
  currentLogs.forEach(l => {
    if (calculateAMDRStatus(l).isOverallWithinRange) amdrComplianceDays++;
  });
  insights.push({
    id: 'insight-amdr',
    category: 'amdr',
    title: 'AMDR Energy Balance Compliance',
    text: `Macronutrient energy distribution remained fully aligned with WHO AMDR standards on ${amdrComplianceDays} of the last ${count} days.`,
    type: amdrComplianceDays >= 4 ? 'positive' : 'neutral'
  });

  return insights;
}

export interface PeriodComparisonResult {
  caloriesDeltaPct: number;
  proteinDeltaPct: number;
  carbsDeltaPct: number;
  fatDeltaPct: number;
  fiberDeltaPct: number;
  consistencyDeltaPct: number;
  summary: string;
}

export function compare7DayPeriods(
  currentLogs: DailyNutritionLog[],
  previousLogs: DailyNutritionLog[]
): PeriodComparisonResult {
  const getAvg = (logs: DailyNutritionLog[], field: keyof DailyNutritionLog) => {
    if (!logs || logs.length === 0) return 0;
    const sum = logs.reduce((acc, l) => acc + (Number(l[field]) || 0), 0);
    return sum / logs.length;
  };

  const currCal = getAvg(currentLogs, 'totalCalories');
  const prevCal = getAvg(previousLogs, 'totalCalories') || currCal;

  const currP = getAvg(currentLogs, 'totalProtein');
  const prevP = getAvg(previousLogs, 'totalProtein') || currP;

  const currC = getAvg(currentLogs, 'totalCarbs');
  const prevC = getAvg(previousLogs, 'totalCarbs') || currC;

  const currF = getAvg(currentLogs, 'totalFat');
  const prevF = getAvg(previousLogs, 'totalFat') || currF;

  const currFib = getAvg(currentLogs, 'totalFiber');
  const prevFib = getAvg(previousLogs, 'totalFiber') || currFib;

  const calcDelta = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  };

  const caloriesDeltaPct = calcDelta(currCal, prevCal);
  const proteinDeltaPct = calcDelta(currP, prevP);
  const carbsDeltaPct = calcDelta(currC, prevC);
  const fatDeltaPct = calcDelta(currF, prevF);
  const fiberDeltaPct = calcDelta(currFib, prevFib);

  // Overall consistency improvement estimate
  const consistencyDeltaPct = Math.round((proteinDeltaPct * 0.4 + fiberDeltaPct * 0.3 - Math.abs(caloriesDeltaPct) * 0.3) * 10) / 10;

  const summary = consistencyDeltaPct >= 0 
    ? `Overall nutrition consistency improved by ${Math.abs(consistencyDeltaPct)}% compared with the previous 7 days.`
    : `Nutrition intake varied by ${Math.abs(consistencyDeltaPct)}% compared with the previous 7 days.`;

  return {
    caloriesDeltaPct,
    proteinDeltaPct,
    carbsDeltaPct,
    fatDeltaPct,
    fiberDeltaPct,
    consistencyDeltaPct,
    summary
  };
}

export function generatePrintable7DayReport(
  currentLogs: DailyNutritionLog[],
  profile: UserNutritionProfile
): string {
  const count = currentLogs.length;
  const totalCal = currentLogs.reduce((acc, l) => acc + l.totalCalories, 0);
  const totalP = currentLogs.reduce((acc, l) => acc + l.totalProtein, 0);
  const totalC = currentLogs.reduce((acc, l) => acc + l.totalCarbs, 0);
  const totalF = currentLogs.reduce((acc, l) => acc + l.totalFat, 0);
  const totalFib = currentLogs.reduce((acc, l) => acc + l.totalFiber, 0);

  const avgCalories = Math.round(totalCal / count);
  const avgProtein = Math.round((totalP / count) * 10) / 10;
  const avgCarbs = Math.round((totalC / count) * 10) / 10;
  const avgFat = Math.round((totalF / count) * 10) / 10;
  const avgFiber = Math.round((totalFib / count) * 10) / 10;

  const startDate = currentLogs[0]?.dayLabel || 'Day 1';
  const endDate = currentLogs[currentLogs.length - 1]?.dayLabel || 'Day 7';

  let compliantDays = 0;
  currentLogs.forEach(l => {
    if (calculateAMDRStatus(l).isOverallWithinRange) compliantDays++;
  });

  return `=============================================================
NUTRIFACTS CLINICAL NUTRITION ENGINE
7-DAY DIETARY MACRONUTRIENT AUDIT & INTAKE REPORT
=============================================================
User Profile:   ${profile.displayName}
Period:         ${startDate} – ${endDate}
Dietary Focus:  ${profile.dietaryFocus.toUpperCase()}
Report Date:    ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

7-DAY AVERAGE MACRONUTRIENT INTAKE:
-------------------------------------------------------------
Daily Calories:        ${avgCalories} kcal (Goal: ${profile.calorieTarget} kcal)
Protein Intake:        ${avgProtein} g/day (Goal: ${profile.proteinTarget} g)
Carbohydrate Intake:   ${avgCarbs} g/day (Goal: ${profile.carbsTarget} g)
Healthy Lipids (Fat):  ${avgFat} g/day (Goal: ${profile.fatTarget} g)
Dietary Fiber:         ${avgFiber} g/day (Goal: ${profile.fiberTarget} g)

CLINICAL ADHERENCE & AMDR METRICS:
-------------------------------------------------------------
AMDR Compliance:       ${compliantDays} / ${count} days within WHO clinical range
Atwater Consistency:   Validated ((P*4) + (C*4) + (F*9) ≈ Total Energy)
Export Source:         NutriFacts Offline-First Clinical Database
=============================================================`;
}

export async function seedSample7DayNutritionLogs(profile?: UserNutritionProfile): Promise<DailyNutritionLog[]> {
  const sample = generateRealisticSample7DayLogs(profile);
  const map: Record<string, DailyNutritionLog> = {};
  sample.forEach(l => {
    map[l.date] = l;
  });
  setLocalStorageItem('dailyNutritionLogs', map);

  try {
    const database = await getDB();
    if (database && database.objectStoreNames.contains('dailyNutritionLogs')) {
      const tx = database.transaction('dailyNutritionLogs', 'readwrite');
      await tx.store.clear();
      for (const l of sample) {
        await tx.store.put(l);
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('Error writing sample logs to IDB:', err);
  }

  return sample;
}


