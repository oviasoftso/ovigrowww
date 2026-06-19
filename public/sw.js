// Custom Service Worker for OviGrow
// This enhances the PWA capabilities with custom caching strategies

const CACHE_NAME = 'ovigrow-v1';
const OFFLINE_URL = '/offline.html';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
  // Core application assets
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  // Add any other critical assets
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests for offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
        .then((response) => response)
    );
    return;
  }

  // For other requests, use cache-first strategy with network fallback
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-success responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response to put in cache and return original
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, try to serve an offline fallback
            // For non-navigation requests, we might want to return a generic fallback
            // or let the browser handle the error
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Background sync for offline data synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ovigrow-data') {
    event.waitUntil(syncOviGrowData());
  }
});

// Periodic background sync for regular updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-ovigrow-data') {
    event.waitUntil(updateOviGrowData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'OviGrow notification',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icon-192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('OviGrow', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle notification actions
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for data synchronization
async function syncOviGrowData() {
  // Implement actual sync logic with Supabase or backend
  // This is a placeholder for the real implementation
  console.log('Syncing OviGrow data...');
  
  // Example: Process offline queue, sync with server, etc.
  // In a real implementation, this would:
  // 1. Check for offline changes in IndexedDB
  // 2. Send them to the server
  // 3. Update local state with server response
  // 4. Handle conflicts if any
  
  return Promise.resolve();
}

async function updateOviGrowData() {
  // Implement periodic updates (e.g., weather, market prices)
  console.log('Updating OviGrow data...');
  
  // Example: Fetch latest weather data, market prices, etc.
  // and update local cache
  
  return Promise.resolve();
}