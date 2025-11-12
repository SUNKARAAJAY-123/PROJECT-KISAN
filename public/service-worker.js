// Service Worker for Project Kisan
const CACHE_NAME = 'project-kisan-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html',
  // Add CSS, JS, and other important assets
];

// Install event - precache key resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching App Shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, serve the offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // For other requests, use a stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Use cached version if available
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update cache with new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.log('[Service Worker] Fetch failed; returning offline page instead.', error);
          // Only return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          // For other requests, just return the cached response or null
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync stored form data when back online
async function syncForms() {
  try {
    // Get stored form submissions from IndexedDB
    const db = await openDatabase();
    const formData = await getStoredFormData(db);
    
    // Process each stored submission
    for (const data of formData) {
      try {
        // Attempt to send the data
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body,
        });
        
        // If successful, remove from storage
        await removeFormData(db, data.id);
      } catch (error) {
        console.error('Failed to sync form data:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncForms:', error);
  }
}

// Helper functions for IndexedDB operations
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineFormsDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('formSubmissions')) {
        db.createObjectStore('formSubmissions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function getStoredFormData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formSubmissions'], 'readonly');
    const store = transaction.objectStore('formSubmissions');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removeFormData(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formSubmissions'], 'readwrite');
    const store = transaction.objectStore('formSubmissions');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const notification = event.data.json();
  const options = {
    body: notification.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: notification.data,
    vibrate: [100, 50, 100],
    actions: notification.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification click - open appropriate page
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});