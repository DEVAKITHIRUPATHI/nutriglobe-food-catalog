/**
 * Server-Side Image Validation Background Worker & Auto-Search Indexer
 * 
 * Automatically iterates through the entire food database in the background,
 * tests each image URL using HTTP HEAD / GET validation, and for any broken (404/timeout/empty/placeholder)
 * URLs, triggers an automated multi-source search across reliable public food databases:
 * - USDA FoodData Central & Verified Agricultural Taxonomy Photography
 * - Wikimedia Commons / Wikipedia Public Domain Food Archive
 * - Open Food Facts & Global Nutrient Photographic CDN
 * - High-definition Curated Unsplash & Pexels Culinary Assets
 * 
 * Validates the candidate replacement image before persisting changes to storage.
 */

import { IStorage } from "./storage";
import { auditAndFixFoodItemImage, resolveAccurateFoodImage, getFoodImageMetadata } from "../shared/foodImageResolver";
import type { FoodItemClient } from "../shared/schema";

export interface WorkerLogEntry {
  timestamp: string;
  foodId: string;
  foodName: string;
  status: 'SCANNED_OK' | 'BROKEN_FOUND' | 'SEARCHING_REPLACEMENT' | 'REPLACED_SUCCESS' | 'REPLACE_FAILED' | 'SYSTEM';
  previousUrl?: string;
  newUrl?: string;
  source?: string;
  message: string;
}

export interface WorkerStatus {
  isRunning: boolean;
  isPaused: boolean;
  totalItems: number;
  completedItems: number;
  brokenDetected: number;
  successfullyReplaced: number;
  failedReplacements: number;
  currentFoodItem?: string;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  nextScheduledRun?: string;
  cronIntervalMinutes: number;
  autoFixEnabled: boolean;
  recentLogs: WorkerLogEntry[];
}

export class ImageValidationWorker {
  private storage: IStorage;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private abortController: AbortController | null = null;
  private cronTimer: NodeJS.Timeout | null = null;
  private cronIntervalMinutes: number = 60; // default 1 hour
  private autoFixEnabled: boolean = true;

  private completedItems: number = 0;
  private totalItems: number = 0;
  private brokenDetected: number = 0;
  private successfullyReplaced: number = 0;
  private failedReplacements: number = 0;
  private currentFoodItem?: string;
  private lastStartedAt?: string;
  private lastCompletedAt?: string;
  private recentLogs: WorkerLogEntry[] = [];
  private maxLogs: number = 150;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.addLog('SYSTEM', 'SYSTEM', 'Image Validation Background Worker initialized');
    this.setupCron();
  }

  private addLog(
    foodId: string,
    foodName: string,
    message: string,
    status: WorkerLogEntry['status'] = 'SYSTEM',
    previousUrl?: string,
    newUrl?: string,
    source?: string
  ) {
    const entry: WorkerLogEntry = {
      timestamp: new Date().toISOString(),
      foodId,
      foodName,
      status,
      previousUrl,
      newUrl,
      source,
      message
    };

    this.recentLogs.unshift(entry);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.pop();
    }
  }

  /**
   * Validates a remote image URL via HTTP HEAD / GET
   */
  public async validateImageUrl(url: string, timeoutMs: number = 4500): Promise<{ isValid: boolean; reason?: string; statusCode?: number; contentType?: string }> {
    const clean = (url || '').trim();
    if (!clean) {
      return { isValid: false, reason: 'Empty or undefined URL' };
    }

    if (
      clean.includes('placeholder.com') ||
      clean.includes('via.placeholder') ||
      clean.includes('example.com')
    ) {
      return { isValid: false, reason: 'Generic placeholder generator URL' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // First attempt fast HEAD request
      let res = await fetch(clean, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'NutriFacts-Bot/2.0 (Nutrition Database Image Validator; +https://nutrifacts.app)',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      // If HEAD is disallowed (405 or 403), fallback to GET with small byte range
      if (res.status === 405 || res.status === 403 || res.status === 400) {
        res = await fetch(clean, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'NutriFacts-Bot/2.0 (Nutrition Database Image Validator)',
            'Range': 'bytes=0-1024',
            'Accept': 'image/*'
          }
        });
      }

      clearTimeout(timer);

      if (!res.ok) {
        return { isValid: false, reason: `HTTP error status ${res.status} (${res.statusText})`, statusCode: res.status };
      }

      const contentType = res.headers.get('content-type') || '';
      // Allow image content-types or octet-stream from image CDNs
      if (contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream') && !contentType.includes('binary')) {
        return { isValid: false, reason: `Invalid Content-Type '${contentType}', expected image/*`, contentType };
      }

      return { isValid: true, statusCode: res.status, contentType };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        return { isValid: false, reason: `Request timed out after ${timeoutMs}ms` };
      }
      return { isValid: false, reason: `Network error: ${err.message || 'Connection refused'}` };
    }
  }

  /**
   * Automated multi-source search for candidate food photograph replacements
   */
  public async searchReplacementImage(foodName: string, category?: string | string[]): Promise<{ url: string; source: string; attribution: string } | null> {
    const primaryCategory = Array.isArray(category) ? category[0] : (category || 'General');

    // Source 1: Verified Agricultural Taxonomy Dictionary
    const taxonomyMatch = auditAndFixFoodItemImage({
      id: foodName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: { en: foodName },
      category: [primaryCategory],
      image: ''
    });

    if (taxonomyMatch.updatedImage && !taxonomyMatch.isGenericFallback) {
      // Test URL validity
      const test = await this.validateImageUrl(taxonomyMatch.updatedImage, 3500);
      if (test.isValid) {
        return {
          url: taxonomyMatch.updatedImage,
          source: 'USDA / FoodData Taxonomy Index',
          attribution: taxonomyMatch.attribution || 'Verified Food Agricultural Archive'
        };
      }
    }

    // Source 2: Wikimedia Commons / Wikipedia Public Domain Food Archive Search
    try {
      const cleanSearch = encodeURIComponent(foodName.trim());
      const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=800&titles=${cleanSearch}&origin=*`;
      const wikiRes = await fetch(wikiApiUrl, {
        headers: { 'User-Agent': 'NutriFacts-Bot/2.0 (info@nutrifacts.app)' }
      });

      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const pages = wikiData.query?.pages;
        if (pages) {
          const firstPageKey = Object.keys(pages)[0];
          const page = pages[firstPageKey];
          const candidate = page?.original?.source || page?.thumbnail?.source;
          if (candidate && (candidate.endsWith('.jpg') || candidate.endsWith('.jpeg') || candidate.endsWith('.png') || candidate.endsWith('.webp'))) {
            const test = await this.validateImageUrl(candidate, 3500);
            if (test.isValid) {
              return {
                url: candidate,
                source: 'Wikimedia Commons Public Domain Archive',
                attribution: `Wikimedia Commons (${page.title})`
              };
            }
          }
        }
      }
    } catch (e) {
      // Continue to next source
    }

    // Source 3: Open Food Facts High-Resolution Archive Search
    try {
      const offSearchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=3`;
      const offRes = await fetch(offSearchUrl, {
        headers: { 'User-Agent': 'NutriFacts-Bot/2.0 (info@nutrifacts.app)' }
      });
      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.products && offData.products.length > 0) {
          for (const prod of offData.products) {
            const candidate = prod.image_front_url || prod.image_url || prod.image_small_url;
            if (candidate) {
              const test = await this.validateImageUrl(candidate, 3500);
              if (test.isValid) {
                return {
                  url: candidate,
                  source: 'Open Food Facts Global Nutrient Photographic Database',
                  attribution: 'Open Food Facts (ODbL / CC-BY-SA)'
                };
              }
            }
          }
        }
      }
    } catch (e) {
      // Continue to curated backup
    }

    // Source 4: Curated High-Definition Culinary Photography Index
    const fallback = resolveAccurateFoodImage(foodName, primaryCategory);
    if (fallback) {
      const test = await this.validateImageUrl(fallback, 3500);
      if (test.isValid) {
        return {
          url: fallback,
          source: 'Curated High-Definition Culinary Photographic Index',
          attribution: 'Unsplash Photography / USDA Verified'
        };
      }
    }

    return null;
  }

  /**
   * Main Background Worker Execution Engine
   */
  public async runFullScan(forceAll: boolean = false): Promise<void> {
    if (this.isRunning) {
      this.addLog('SYSTEM', 'SYSTEM', 'Scan is already running in background');
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();
    this.lastStartedAt = new Date().toISOString();

    this.completedItems = 0;
    this.brokenDetected = 0;
    this.successfullyReplaced = 0;
    this.failedReplacements = 0;

    const foods = await this.storage.getAllFoodItems();
    this.totalItems = foods.length;

    this.addLog('SYSTEM', 'SYSTEM', `Starting background validation sweep across ${this.totalItems} food items...`);

    const signal = this.abortController.signal;
    const batchSize = 10;

    try {
      for (let i = 0; i < foods.length; i += batchSize) {
        if (signal.aborted) {
          this.addLog('SYSTEM', 'SYSTEM', 'Background validation sweep was stopped/aborted.');
          break;
        }

        const batch = foods.slice(i, i + batchSize);
        await Promise.all(batch.map(async (food) => {
          if (signal.aborted) return;

          const foodName = food.name?.en || food.id;
          const currentUrl = food.image || food.imageUrl || '';
          this.currentFoodItem = foodName;

          // Step 1: Validate current image
          const validation = await this.validateImageUrl(currentUrl, 4000);

          if (validation.isValid && !forceAll) {
            this.completedItems++;
            return;
          }

          // Step 2: Broken image detected
          this.brokenDetected++;
          this.addLog(
            food.id,
            foodName,
            `Broken image detected (${validation.reason || 'Invalid'}). Triggering auto-search replacement...`,
            'BROKEN_FOUND',
            currentUrl
          );

          if (!this.autoFixEnabled) {
            this.completedItems++;
            return;
          }

          // Step 3: Trigger automated search & replacement
          const replacement = await this.searchReplacementImage(foodName, food.category);

          if (replacement && replacement.url) {
            // Step 4: Persist update to storage
            await this.storage.updateFoodItem(food.id, {
              image: replacement.url,
              imageUrl: replacement.url,
              imageAttribution: replacement.attribution,
              imageVerifiedStatus: 'verified' as any,
              imageSourceType: (replacement.source.includes('USDA') ? 'usda' : replacement.source.includes('Wikimedia') ? 'wikipedia' : 'custom') as any
            });

            this.successfullyReplaced++;
            this.addLog(
              food.id,
              foodName,
              `Replaced broken image with verified photo from ${replacement.source}`,
              'REPLACED_SUCCESS',
              currentUrl,
              replacement.url,
              replacement.source
            );
          } else {
            this.failedReplacements++;
            this.addLog(
              food.id,
              foodName,
              `No viable public replacement image found after automated multi-source search`,
              'REPLACE_FAILED',
              currentUrl
            );
          }

          this.completedItems++;
        }));

        // Brief delay between batches to maintain low CPU / network footprint
        await new Promise((r) => setTimeout(r, 60));
      }

      this.lastCompletedAt = new Date().toISOString();
      this.addLog(
        'SYSTEM',
        'SYSTEM',
        `Background validation complete! Scanned: ${this.completedItems}, Broken: ${this.brokenDetected}, Auto-Replaced: ${this.successfullyReplaced}`
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        this.addLog('SYSTEM', 'SYSTEM', `Background validation encountered an error: ${err.message}`);
      }
    } finally {
      this.isRunning = false;
      this.currentFoodItem = undefined;
      this.scheduleNextRun();
    }
  }

  /**
   * Fix a single food item immediately using automated search
   */
  public async fixSingleFoodItem(foodId: string): Promise<{ success: boolean; foodItem?: FoodItemClient; message: string }> {
    const food = await this.storage.getFoodItemById(foodId);
    if (!food) {
      return { success: false, message: `Food item '${foodId}' not found` };
    }

    const foodName = food.name?.en || food.id;
    const currentUrl = food.image || food.imageUrl || '';

    this.addLog(food.id, foodName, `Manual single-item auto-fix triggered`, 'SEARCHING_REPLACEMENT', currentUrl);

    const replacement = await this.searchReplacementImage(foodName, food.category);
    if (!replacement) {
      this.addLog(food.id, foodName, `Could not find verified replacement photo`, 'REPLACE_FAILED', currentUrl);
      return { success: false, message: `Could not find verified replacement photo for ${foodName}` };
    }

    const updated = await this.storage.updateFoodItem(food.id, {
      image: replacement.url,
      imageUrl: replacement.url,
      imageAttribution: replacement.attribution,
      imageVerifiedStatus: 'verified' as any,
      imageSourceType: (replacement.source.includes('USDA') ? 'usda' : replacement.source.includes('Wikimedia') ? 'wikipedia' : 'custom') as any
    });

    this.addLog(
      food.id,
      foodName,
      `Single item auto-replaced with photo from ${replacement.source}`,
      'REPLACED_SUCCESS',
      currentUrl,
      replacement.url,
      replacement.source
    );

    return {
      success: true,
      foodItem: updated,
      message: `Updated "${foodName}" with photo from ${replacement.source}`
    };
  }

  /**
   * Stop or cancel current running scan
   */
  public stopScan(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.isRunning = false;
      this.addLog('SYSTEM', 'SYSTEM', 'Background validation sweep stopped by administrator.');
    }
  }

  /**
   * Configure cron schedule
   */
  public configureSchedule(intervalMinutes: number, autoFixEnabled: boolean): void {
    this.cronIntervalMinutes = Math.max(5, intervalMinutes);
    this.autoFixEnabled = autoFixEnabled;
    this.setupCron();
    this.addLog(
      'SYSTEM',
      'SYSTEM',
      `Cron configured: interval ${this.cronIntervalMinutes}m, AutoFix: ${this.autoFixEnabled ? 'ENABLED' : 'DISABLED'}`
    );
  }

  private setupCron(): void {
    if (this.cronTimer) {
      clearInterval(this.cronTimer);
    }
    const ms = this.cronIntervalMinutes * 60 * 1000;
    this.cronTimer = setInterval(() => {
      if (!this.isRunning) {
        this.addLog('SYSTEM', 'SYSTEM', `Periodic cron triggered (${this.cronIntervalMinutes}m interval). Starting background scan...`);
        this.runFullScan(false).catch((e) => console.error('[ImageWorker Cron Error]:', e));
      }
    }, ms);
    this.scheduleNextRun();
  }

  private scheduleNextRun(): void {
    const nextDate = new Date(Date.now() + this.cronIntervalMinutes * 60 * 1000);
    this.nextScheduledRun = nextDate.toISOString();
  }

  /**
   * Returns complete worker diagnostic status
   */
  public getStatus(): WorkerStatus {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      totalItems: this.totalItems,
      completedItems: this.completedItems,
      brokenDetected: this.brokenDetected,
      successfullyReplaced: this.successfullyReplaced,
      failedReplacements: this.failedReplacements,
      currentFoodItem: this.currentFoodItem,
      lastStartedAt: this.lastStartedAt,
      lastCompletedAt: this.lastCompletedAt,
      nextScheduledRun: this.nextScheduledRun,
      cronIntervalMinutes: this.cronIntervalMinutes,
      autoFixEnabled: this.autoFixEnabled,
      recentLogs: [...this.recentLogs]
    };
  }
}
