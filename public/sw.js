// Service Worker for offline functionality
const CACHE_NAME = 'fieldflow-v1.0.0'
const STATIC_CACHE = 'fieldflow-static-v1'
const DYNAMIC_CACHE = 'fieldflow-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/fieldflow-icon.svg',
  '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        // Cache dynamic content
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      }).catch(() => {
        // Return offline page if available
        if (request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'fieldflow-sync') {
    console.log('Service Worker: Background sync triggered')
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // Get pending changes from IndexedDB
    const pendingChanges = await getPendingChanges()
    
    for (const change of pendingChanges) {
      try {
        // Attempt to sync each change
        await syncChange(change)
        // Remove from pending if successful
        await removePendingChange(change.id)
      } catch (error) {
        console.error('Failed to sync change:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Helper functions for IndexedDB operations
async function getPendingChanges() {
  // Implementation would depend on IndexedDB structure
  return []
}

async function syncChange(change) {
  // Implementation for syncing individual changes
  return Promise.resolve()
}

async function removePendingChange(id) {
  // Implementation for removing synced changes
  return Promise.resolve()
}