// Enhanced Service Worker with Stale-While-Revalidate Strategy
const CACHE_NAME = 'fieldflow-v1.2.0'
const STATIC_CACHE = 'fieldflow-static-v1'
const DYNAMIC_CACHE = 'fieldflow-dynamic-v1'
const API_CACHE = 'fieldflow-api-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/fieldflow-icon.svg',
  '/manifest.json'
]

// API endpoints to cache with stale-while-revalidate strategy
const API_ENDPOINTS = [
  '/rest/v1/projects_ff2024',
  '/rest/v1/tasks_ff2024',
  '/rest/v1/daily_logs_ff2024',
  '/rest/v1/time_entries_ff2024',
  '/rest/v1/documents_ff2024'
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
          if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Enhanced fetch event with stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return

  // Handle API requests with stale-while-revalidate
  if (isAPIRequest(request.url)) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Handle static assets with cache-first
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Handle navigation requests with network-first
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request))
    return
  }

  // Default strategy for other requests
  event.respondWith(networkFirst(request))
})

// Enhanced stale-while-revalidate strategy for API requests
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE)
  const cachedResponse = await cache.match(request)

  // Start network request immediately
  const networkPromise = fetch(request).then(async (response) => {
    if (response && response.status === 200) {
      // Clone and cache the response
      const responseClone = response.clone()
      await cache.put(request, responseClone)
      
      // Notify clients about fresh data
      notifyClients('DATA_UPDATED', {
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      })
    }
    return response
  }).catch(error => {
    console.log('Network request failed:', error)
    return null
  })

  // Return cached response immediately if available
  if (cachedResponse) {
    // Network request continues in background
    networkPromise.catch(() => {}) // Prevent unhandled rejection
    return cachedResponse
  }

  // Wait for network if no cache available
  const networkResponse = await networkPromise
  if (networkResponse) {
    return networkResponse
  }

  // Return offline fallback
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'No cached data available',
      timestamp: new Date().toISOString()
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const responseClone = networkResponse.clone()
      await cache.put(request, responseClone)
    }
    return networkResponse
  } catch (error) {
    console.log('Network request failed for static asset:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network-first strategy for navigation
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      const responseClone = networkResponse.clone()
      await cache.put(request, responseClone)
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network request failed, trying cache:', error)
    
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page if available
    if (request.destination === 'document') {
      const offlinePage = await cache.match('/index.html')
      if (offlinePage) {
        return offlinePage
      }
    }

    return new Response('Offline', { status: 503 })
  }
}

// Helper functions
function isAPIRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint)) ||
         url.includes('supabase.co/rest/v1/') ||
         url.includes('supabase.co/storage/v1/')
}

function isStaticAsset(url) {
  return url.includes('.js') ||
         url.includes('.css') ||
         url.includes('.svg') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.ico')
}

function notifyClients(type, data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data })
    })
  })
}

// Enhanced background sync with exponential backoff
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered for:', event.tag)
  
  if (event.tag === 'fieldflow-sync') {
    event.waitUntil(syncOfflineData())
  } else if (event.tag.startsWith('fieldflow-retry-')) {
    const changeId = event.tag.replace('fieldflow-retry-', '')
    event.waitUntil(retryFailedChange(changeId))
  }
})

async function syncOfflineData() {
  try {
    const pendingChanges = await getPendingChanges()
    let syncedCount = 0
    let failedCount = 0

    // Process changes with exponential backoff for failures
    for (const change of pendingChanges) {
      try {
        await syncChangeWithRetry(change)
        await removePendingChange(change.id)
        syncedCount++
      } catch (error) {
        console.error('Failed to sync change:', error)
        await moveToFailedChanges(change, error.message)
        failedCount++
      }
    }

    // Notify clients of sync results
    notifyClients('SYNC_COMPLETE', {
      synced: syncedCount,
      failed: failedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Background sync failed:', error)
    notifyClients('SYNC_ERROR', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

async function syncChangeWithRetry(change, maxRetries = 3) {
  let attempt = 0
  let lastError

  while (attempt < maxRetries) {
    try {
      await syncChange(change)
      return // Success
    } catch (error) {
      lastError = error
      attempt++
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError // All retries failed
}

async function retryFailedChange(changeId) {
  try {
    const failedChanges = await getFailedChanges()
    const change = failedChanges.find(c => c.id === changeId)
    
    if (change && change.retryCount < 3) {
      await syncChangeWithRetry(change)
      await removeFailedChange(changeId)
      notifyClients('RETRY_SUCCESS', { changeId })
    }
  } catch (error) {
    console.error('Retry failed:', error)
    await incrementRetryCount(changeId)
    notifyClients('RETRY_FAILED', { changeId, error: error.message })
  }
}

// Enhanced IndexedDB operations for offline data management
async function getPendingChanges() {
  const stored = await getFromIndexedDB('pendingChanges')
  return stored || []
}

async function getFailedChanges() {
  const stored = await getFromIndexedDB('failedChanges')
  return stored || []
}

async function removePendingChange(changeId) {
  const changes = await getPendingChanges()
  const filtered = changes.filter(c => c.id !== changeId)
  await saveToIndexedDB('pendingChanges', filtered)
}

async function moveToFailedChanges(change, error) {
  const failedChanges = await getFailedChanges()
  const updatedChange = {
    ...change,
    error,
    retryCount: (change.retryCount || 0) + 1,
    lastFailedAt: new Date().toISOString()
  }
  await saveToIndexedDB('failedChanges', [...failedChanges, updatedChange])
}

async function removeFailedChange(changeId) {
  const changes = await getFailedChanges()
  const filtered = changes.filter(c => c.id !== changeId)
  await saveToIndexedDB('failedChanges', filtered)
}

async function incrementRetryCount(changeId) {
  const failedChanges = await getFailedChanges()
  const updated = failedChanges.map(change =>
    change.id === changeId
      ? { ...change, retryCount: (change.retryCount || 0) + 1 }
      : change
  )
  await saveToIndexedDB('failedChanges', updated)
}

// Simple IndexedDB wrapper functions
async function getFromIndexedDB(key) {
  return new Promise((resolve) => {
    // Simplified implementation - in production, use proper IndexedDB
    const stored = localStorage.getItem(`sw-${key}`)
    resolve(stored ? JSON.parse(stored) : null)
  })
}

async function saveToIndexedDB(key, data) {
  return new Promise((resolve) => {
    localStorage.setItem(`sw-${key}`, JSON.stringify(data))
    resolve()
  })
}

async function syncChange(change) {
  // Enhanced sync with better error handling
  return new Promise((resolve, reject) => {
    // Simulate API call with realistic timing
    const baseDelay = 500 + Math.random() * 500 // 500-1000ms
    
    setTimeout(() => {
      // 95% success rate for more realistic simulation
      if (Math.random() > 0.05) {
        resolve({
          id: change.id,
          synced: true,
          timestamp: new Date().toISOString()
        })
      } else {
        reject(new Error(`Sync failed for ${change.type} operation`))
      }
    }, baseDelay)
  })
}