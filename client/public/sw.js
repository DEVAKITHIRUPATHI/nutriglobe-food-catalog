// NutriGlobe Service Worker - 1M DAU Offline-First Engine
// Stale-While-Revalidate Caching for Food API & Cache-First for Static Assets

const CACHE_NAME = 'nutriglobe-v1-static';
const API_CACHE_NAME = 'nutriglobe-v1-food-db';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/generated-icon.png',
  '/robots.txt'
];

// Install Event: Precache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== API_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate for Food API & Network-First / Cache-Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Food Database API Endpoints -> Stale-While-Revalidate Strategy
  if (url.pathname.startsWith('/api/foods') || url.pathname.startsWith('/api/stats')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        // Background revalidation fetch
        const networkFetch = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[SW] Offline or network error for API:', url.pathname, err);
          return cachedResponse;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 2. Images (Unsplash / Local Assets) -> Cache-First with Expiration Fallback
  if (request.destination === 'image' || url.hostname.includes('unsplash.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedImage = await cache.match(request);
        if (cachedImage) return cachedImage;

        try {
          const networkImage = await fetch(request);
          if (networkImage && networkImage.status === 200) {
            cache.put(request, networkImage.clone());
          }
          return networkImage;
        } catch {
          // If image fetch fails, return cached fallback or placeholder
          return caches.match('/generated-icon.png');
        }
      })
    );
    return;
  }

  // 3. Navigation / HTML & Static Assets -> Network First with Cache Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh version in background for assets
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
