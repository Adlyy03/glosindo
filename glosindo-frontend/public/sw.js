/**
 * GLOSINDO Digital Guestbook — Service Worker (PWA Kiosk)
 * Memberikan dukungan offline, caching model biometrik wajah, dan keandalan kiosk.
 */

const CACHE_NAME = 'glosindo-pwa-v1';
const MODELS_CACHE_NAME = 'glosindo-face-models-v1';
const STATIC_CACHE_NAME = 'glosindo-static-v1';

// Aset inti yang langsung di-cache saat Service Worker terinstall
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo-glosindo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. Install Event — Pre-caching Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event — Clean Old Caches & Take Control
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, MODELS_CACHE_NAME, STATIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Smart Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan tangani request selain GET (POST/PUT/DELETE biarkan langsung ke network)
  if (request.method !== 'GET') {
    return;
  }

  // A. Model Bobot Face-API (/models/) -> Cache-First
  // Sangat penting agar model AI wajah 12MB tetap berfungsi saat koneksi internet kantor putus/kedip
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.open(MODELS_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // B. Aset Statis Frontend (/assets/, icons, images, fonts) -> Cache-First with Network Fallback
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(?:js|css|png|jpg|jpeg|webp|svg|woff2|woff|ttf|ico)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Update cache di background (Stale-while-revalidate)
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse);
              }
            }).catch(() => {});
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // C. API Requests (/api/) -> Network-First with Offline JSON Graceful Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            offline: true,
            message: 'Koneksi internet kantor terputus. Sistem kiosk berjalan dalam mode offline.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // D. SPA Navigation (Halaman HTML / Navigasi Route) -> Network-First, fallback to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Default: Network Fetch
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});

