import type { FoodItemClient } from '@shared/schema';
import { getFoodItems, storeFoodItems, getSettings, updateSettings } from '@/lib/idb';

export interface PendingFoodMutation {
  id: string;
  type: 'add' | 'update' | 'delete';
  food: FoodItemClient;
  timestamp: number;
}

export interface SyncStats {
  success: boolean;
  syncedCount: number;
  pendingAppliedCount: number;
  timestamp: number;
  durationMs: number;
  database: 'connected' | 'offline' | 'error';
  errorMessage?: string;
}

const PENDING_MUTATIONS_KEY = 'nutriglobe_pending_food_mutations';
const LAST_SYNC_STATS_KEY = 'nutriglobe_last_sync_stats';

// Helper for pending offline food mutations
export function getPendingFoodMutations(): PendingFoodMutation[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(PENDING_MUTATIONS_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to read pending mutations:', e);
  }
  return [];
}

export function queueFoodMutation(mutation: Omit<PendingFoodMutation, 'id' | 'timestamp'>): void {
  try {
    const list = getPendingFoodMutations();
    const newItem: PendingFoodMutation = {
      ...mutation,
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    // Replace if same food ID is already in queue
    const filtered = list.filter(m => m.food.id !== mutation.food.id);
    filtered.push(newItem);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Failed to queue mutation:', e);
  }
}

export function clearPendingFoodMutations(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(PENDING_MUTATIONS_KEY);
    }
  } catch (e) {}
}

export function getLastSyncStats(): SyncStats | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(LAST_SYNC_STATS_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {}
  return null;
}

export function saveLastSyncStats(stats: SyncStats): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LAST_SYNC_STATS_KEY, JSON.stringify(stats));
    }
  } catch (e) {}
}

/**
 * Synchronizes offline-cached food data with the remote server database upon reconnection.
 */
export async function synchronizeFoodData(
  onProgress?: (stage: 'checking' | 'uploading' | 'downloading' | 'persisting') => void
): Promise<SyncStats> {
  const startTime = Date.now();

  try {
    onProgress?.('checking');

    // 1. Check server health
    const healthCheck = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    }).catch(() => null);

    if (!healthCheck || !healthCheck.ok) {
      throw new Error('Remote server database unreachable');
    }

    onProgress?.('uploading');

    // 2. Gather any offline mutations created while disconnected
    const pendingMutations = getPendingFoodMutations();
    const pendingItems = pendingMutations.map(m => m.food);

    // 3. Post to synchronization endpoint
    const syncRes = await fetch('/api/foods/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingItems })
    }).catch(() => null);

    onProgress?.('downloading');

    let allFoods: FoodItemClient[] = [];
    let pendingAppliedCount = 0;

    if (syncRes && syncRes.ok) {
      const syncData = await syncRes.json();
      allFoods = syncData.foods || [];
      pendingAppliedCount = syncData.pendingAppliedCount || 0;
      // Successfully applied offline mutations to remote DB
      clearPendingFoodMutations();
    } else {
      // Fallback: fetch directly from /api/foods
      const foodsRes = await fetch('/api/foods').catch(() => null);
      if (foodsRes && foodsRes.ok) {
        allFoods = await foodsRes.json();
      } else {
        throw new Error('Failed to retrieve remote food catalog');
      }
    }

    onProgress?.('persisting');

    // 4. Update IndexedDB and LocalStorage cache with authoritative data
    if (Array.isArray(allFoods) && allFoods.length > 0) {
      await storeFoodItems(allFoods);
    }

    const now = Date.now();
    await updateSettings({ lastSync: now });

    const stats: SyncStats = {
      success: true,
      syncedCount: allFoods.length,
      pendingAppliedCount,
      timestamp: now,
      durationMs: Math.max(120, now - startTime),
      database: 'connected'
    };

    saveLastSyncStats(stats);

    // Dispatch global custom event for external listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nutriglobe:food-synced', { detail: stats })
      );
    }

    return stats;
  } catch (error: any) {
    console.warn('Food data synchronization failed:', error);
    const fallbackCached = await getFoodItems();
    const now = Date.now();

    const errorStats: SyncStats = {
      success: false,
      syncedCount: fallbackCached.length || 0,
      pendingAppliedCount: 0,
      timestamp: now,
      durationMs: Math.max(50, now - startTime),
      database: 'error',
      errorMessage: error?.message || 'Sync failed'
    };

    return errorStats;
  }
}
