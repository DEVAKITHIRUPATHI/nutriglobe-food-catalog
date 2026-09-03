/**
 * ImageValidator Utility
 * Validates whether an image URL is alive, reachable, and renders valid visual content.
 * Uses browser-side Image loading check with timeouts, natural dimension verification,
 * and intelligent caching.
 */

export interface ImageValidationResult {
  url: string;
  isValid: boolean;
  status: 'VALID' | 'BROKEN_404' | 'TIMEOUT' | 'EMPTY_URL' | 'PLACEHOLDER' | 'INVALID_DIMENSIONS' | 'NETWORK_ERROR';
  statusCode?: number;
  width?: number;
  height?: number;
  durationMs?: number;
  errorMessage?: string;
  testedAt: string;
}

// In-memory validation cache to prevent redundant network requests
const validationCache = new Map<string, ImageValidationResult>();

export class ImageValidator {
  /**
   * Validates a single image URL using browser Image object and optional fetch HEAD check.
   */
  static async validate(
    url: string | undefined | null,
    options: {
      timeoutMs?: number;
      minDimension?: number;
      bypassCache?: boolean;
    } = {}
  ): Promise<ImageValidationResult> {
    const { timeoutMs = 6000, minDimension = 10, bypassCache = false } = options;
    const cleanUrl = (url || '').trim();

    if (!cleanUrl) {
      return {
        url: '',
        isValid: false,
        status: 'EMPTY_URL',
        errorMessage: 'Image URL is empty or undefined',
        testedAt: new Date().toISOString(),
      };
    }

    if (!bypassCache && validationCache.has(cleanUrl)) {
      return validationCache.get(cleanUrl)!;
    }

    // Identify obvious generic placeholder strings
    if (
      cleanUrl.includes('placeholder.com') ||
      cleanUrl.includes('via.placeholder') ||
      cleanUrl.includes('example.com')
    ) {
      const res: ImageValidationResult = {
        url: cleanUrl,
        isValid: false,
        status: 'PLACEHOLDER',
        errorMessage: 'URL points to a generic placeholder generator',
        testedAt: new Date().toISOString(),
      };
      validationCache.set(cleanUrl, res);
      return res;
    }

    const startTime = performance.now();

    return new Promise<ImageValidationResult>((resolve) => {
      let isSettled = false;
      const img = new Image();

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          img.src = ''; // Cancel loading
          const duration = Math.round(performance.now() - startTime);
          const result: ImageValidationResult = {
            url: cleanUrl,
            isValid: false,
            status: 'TIMEOUT',
            durationMs: duration,
            errorMessage: `Image loading timed out after ${timeoutMs}ms`,
            testedAt: new Date().toISOString(),
          };
          validationCache.set(cleanUrl, result);
          resolve(result);
        }
      }, timeoutMs);

      img.onload = () => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        const duration = Math.round(performance.now() - startTime);

        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;

        if (w < minDimension || h < minDimension) {
          const result: ImageValidationResult = {
            url: cleanUrl,
            isValid: false,
            status: 'INVALID_DIMENSIONS',
            width: w,
            height: h,
            durationMs: duration,
            errorMessage: `Image dimensions (${w}x${h}) are below minimum threshold (${minDimension}px)`,
            testedAt: new Date().toISOString(),
          };
          validationCache.set(cleanUrl, result);
          resolve(result);
          return;
        }

        const result: ImageValidationResult = {
          url: cleanUrl,
          isValid: true,
          status: 'VALID',
          width: w,
          height: h,
          durationMs: duration,
          testedAt: new Date().toISOString(),
        };
        validationCache.set(cleanUrl, result);
        resolve(result);
      };

      img.onerror = (err) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        const duration = Math.round(performance.now() - startTime);

        const result: ImageValidationResult = {
          url: cleanUrl,
          isValid: false,
          status: 'BROKEN_404',
          durationMs: duration,
          errorMessage: 'Image failed to load (HTTP 404, DNS error, or CORS block)',
          testedAt: new Date().toISOString(),
        };
        validationCache.set(cleanUrl, result);
        resolve(result);
      };

      // Set crossOrigin if remote domain to test properly
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = cleanUrl;
    });
  }

  /**
   * Validates a batch of image URLs concurrently with progress updates and rate-limiting.
   */
  static async validateBatch(
    items: Array<{ id: string; url: string; name?: string }>,
    options: {
      concurrency?: number;
      timeoutMs?: number;
      onProgress?: (completed: number, total: number, latest: { id: string; result: ImageValidationResult }) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<Map<string, ImageValidationResult>> {
    const { concurrency = 8, timeoutMs = 5000, onProgress, signal } = options;
    const results = new Map<string, ImageValidationResult>();
    let currentIndex = 0;
    let completedCount = 0;

    const worker = async () => {
      while (currentIndex < items.length) {
        if (signal?.aborted) break;

        const index = currentIndex++;
        const item = items[index];
        if (!item) break;

        const result = await ImageValidator.validate(item.url, { timeoutMs });
        results.set(item.id, result);
        completedCount++;

        if (onProgress) {
          onProgress(completedCount, items.length, { id: item.id, result });
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);

    return results;
  }

  /**
   * Clears the validation cache
   */
  static clearCache(): void {
    validationCache.clear();
  }

  /**
   * Checks if an image is in the cache
   */
  static getCachedResult(url: string): ImageValidationResult | undefined {
    return validationCache.get(url.trim());
  }
}

export default ImageValidator;
