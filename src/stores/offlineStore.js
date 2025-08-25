import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Enhanced offline store with advanced sync capabilities
export const useOfflineStore = create(
  persist(
    (set, get) => ({
      // Connection state
      isOnline: navigator.onLine,
      lastSync: null,
      syncInProgress: false,

      // Enhanced offline queues
      pendingChanges: [],
      failedChanges: [],
      retryQueue: [],

      // Settings
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds

      // Sync statistics
      syncStats: {
        totalSynced: 0,
        totalFailed: 0,
        lastSyncDuration: 0,
        averageSyncTime: 0
      },

      // Actions
      setOnlineStatus: (isOnline) => set({ isOnline }),

      addPendingChange: (change) =>
        set((state) => {
          const changeWithId = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            retryCount: 0,
            priority: change.priority || 'normal', // high, normal, low
            estimatedDuration: change.estimatedDuration || 1000,
            ...change
          }
          return {
            ...state,
            pendingChanges: [...state.pendingChanges, changeWithId]
          }
        }),

      removePendingChange: (changeId) =>
        set((state) => ({
          ...state,
          pendingChanges: state.pendingChanges.filter(change => change.id !== changeId)
        })),

      movePendingToFailed: (changeId, error) =>
        set((state) => {
          const changeIndex = state.pendingChanges.findIndex(change => change.id === changeId)
          if (changeIndex !== -1) {
            const change = { ...state.pendingChanges[changeIndex] }
            change.error = error
            change.retryCount += 1
            change.lastFailedAt = new Date().toISOString()

            const newPendingChanges = [...state.pendingChanges]
            newPendingChanges.splice(changeIndex, 1)

            return {
              ...state,
              pendingChanges: newPendingChanges,
              failedChanges: [...state.failedChanges, change],
              syncStats: {
                ...state.syncStats,
                totalFailed: state.syncStats.totalFailed + 1
              }
            }
          }
          return state
        }),

      retryFailedChange: (changeId) =>
        set((state) => {
          const changeIndex = state.failedChanges.findIndex(change => change.id === changeId)
          if (changeIndex !== -1) {
            const change = state.failedChanges[changeIndex]
            if (change.retryCount < state.maxRetries) {
              const newFailedChanges = [...state.failedChanges]
              newFailedChanges.splice(changeIndex, 1)

              // Add exponential backoff delay
              const delay = Math.min(state.retryDelay * Math.pow(2, change.retryCount), 60000)

              setTimeout(() => {
                set((currentState) => ({
                  ...currentState,
                  pendingChanges: [...currentState.pendingChanges, change]
                }))
              }, delay)

              return {
                ...state,
                failedChanges: newFailedChanges,
                retryQueue: [
                  ...state.retryQueue,
                  { changeId, retryAt: Date.now() + delay }
                ]
              }
            }
          }
          return state
        }),

      retryAllFailedChanges: () => {
        const { failedChanges } = get()
        failedChanges.forEach(change => {
          if (change.retryCount < get().maxRetries) {
            get().retryFailedChange(change.id)
          }
        })
      },

      clearFailedChanges: () =>
        set((state) => ({
          ...state,
          failedChanges: []
        })),

      clearAllPendingChanges: () =>
        set((state) => ({
          ...state,
          pendingChanges: [],
          failedChanges: [],
          retryQueue: []
        })),

      setSyncInProgress: (inProgress) =>
        set((state) => ({
          ...state,
          syncInProgress: inProgress
        })),

      setLastSync: (timestamp) =>
        set((state) => ({
          ...state,
          lastSync: timestamp
        })),

      updateSyncStats: (stats) =>
        set((state) => ({
          ...state,
          syncStats: {
            ...state.syncStats,
            ...stats
          }
        })),

      // Enhanced sync operations with detailed progress tracking
      processPendingChanges: async () => {
        const { pendingChanges, isOnline, maxRetries } = get()

        if (!isOnline || pendingChanges.length === 0) {
          return { success: true, processed: 0, failed: 0 }
        }

        const startTime = Date.now()
        set((state) => ({ ...state, syncInProgress: true }))

        let processed = 0
        let failed = 0

        // Sort by priority: high > normal > low
        const sortedChanges = [...pendingChanges].sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })

        // Process changes with concurrency limit
        const batchSize = 3 // Process 3 changes concurrently
        for (let i = 0; i < sortedChanges.length; i += batchSize) {
          const batch = sortedChanges.slice(i, i + batchSize)
          const batchPromises = batch.map(async (change) => {
            try {
              await executeChange(change)
              get().removePendingChange(change.id)
              return { success: true, changeId: change.id }
            } catch (error) {
              console.error('Failed to sync change:', error)
              get().movePendingToFailed(change.id, error.message)
              return { success: false, changeId: change.id, error }
            }
          })

          const batchResults = await Promise.allSettled(batchPromises)
          batchResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
              processed++
            } else {
              failed++
            }
          })
        }

        const endTime = Date.now()
        const syncDuration = endTime - startTime

        // Update sync statistics
        const currentStats = get().syncStats
        const newAverageTime = currentStats.averageSyncTime === 0
          ? syncDuration
          : (currentStats.averageSyncTime + syncDuration) / 2

        get().updateSyncStats({
          totalSynced: currentStats.totalSynced + processed,
          lastSyncDuration: syncDuration,
          averageSyncTime: newAverageTime
        })

        set((state) => ({
          ...state,
          syncInProgress: false,
          lastSync: new Date().toISOString()
        }))

        return { success: failed === 0, processed, failed, duration: syncDuration }
      },

      // Get detailed sync status
      getSyncStatus: () => {
        const { pendingChanges, failedChanges, syncInProgress, lastSync, syncStats } = get()

        const highPriorityCount = pendingChanges.filter(c => c.priority === 'high').length
        const totalEstimatedTime = pendingChanges.reduce(
          (total, change) => total + (change.estimatedDuration || 1000),
          0
        )

        return {
          pendingCount: pendingChanges.length,
          failedCount: failedChanges.length,
          highPriorityCount,
          syncInProgress,
          lastSync,
          hasChanges: pendingChanges.length > 0 || failedChanges.length > 0,
          estimatedSyncTime: totalEstimatedTime,
          syncStats
        }
      },

      // Get changes by type for debugging
      getChangesByType: () => {
        const { pendingChanges, failedChanges } = get()
        const allChanges = [...pendingChanges, ...failedChanges]

        return allChanges.reduce((acc, change) => {
          const type = change.type || 'unknown'
          if (!acc[type]) acc[type] = []
          acc[type].push(change)
          return acc
        }, {})
      },

      // Purge old failed changes (older than 7 days)
      purgeOldFailedChanges: () =>
        set((state) => {
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
          const recentFailedChanges = state.failedChanges.filter(change => {
            const changeTime = new Date(change.lastFailedAt || change.timestamp).getTime()
            return changeTime > sevenDaysAgo
          })

          return {
            ...state,
            failedChanges: recentFailedChanges
          }
        })
    }),
    {
      name: 'fieldflow-offline-store',
      partialize: (state) => ({
        pendingChanges: state.pendingChanges,
        failedChanges: state.failedChanges,
        lastSync: state.lastSync,
        autoSync: state.autoSync,
        syncInterval: state.syncInterval,
        maxRetries: state.maxRetries,
        retryDelay: state.retryDelay,
        syncStats: state.syncStats
      })
    }
  )
)

// Helper function to execute a change with better error handling
async function executeChange(change) {
  const { type, entity, data, id } = change

  try {
    // Simulate API calls for different operations
    switch (type) {
      case 'create':
        // Simulate create API call
        await new Promise(resolve => setTimeout(resolve, 500))
        return { id: `created-${Date.now()}`, ...data }
      case 'update':
        // Simulate update API call
        await new Promise(resolve => setTimeout(resolve, 300))
        return { id, ...data }
      case 'delete':
        // Simulate delete API call
        await new Promise(resolve => setTimeout(resolve, 200))
        return { id, deleted: true }
      default:
        throw new Error(`Unknown change type: ${type}`)
    }
  } catch (error) {
    // Enhanced error handling with specific error types
    if (error.message?.includes('network')) {
      throw new Error('Network connection failed. Will retry when online.')
    } else if (error.message?.includes('unauthorized')) {
      throw new Error('Authentication expired. Please log in again.')
    } else if (error.message?.includes('conflict')) {
      throw new Error('Data conflict detected. Manual resolution required.')
    } else {
      throw new Error(`Sync failed: ${error.message}`)
    }
  }
}

// Enhanced auto-sync with intelligent scheduling
let syncInterval = null
let retryTimeouts = new Map()

export const startAutoSync = () => {
  const { autoSync, syncInterval: interval, processPendingChanges, isOnline } = useOfflineStore.getState()

  if (!autoSync || syncInterval) return

  syncInterval = setInterval(() => {
    if (navigator.onLine && isOnline) {
      const syncStatus = useOfflineStore.getState().getSyncStatus()

      // Only sync if there are pending changes
      if (syncStatus.pendingCount > 0) {
        // Prioritize high-priority changes
        if (syncStatus.highPriorityCount > 0) {
          processPendingChanges()
        } else {
          // For normal priority, use longer intervals to reduce battery usage
          const now = Date.now()
          const lastSync = new Date(useOfflineStore.getState().lastSync || 0).getTime()
          const timeSinceLastSync = now - lastSync

          if (timeSinceLastSync > interval * 2) { // Wait 2x interval for normal priority
            processPendingChanges()
          }
        }
      }
    }
  }, interval)
}

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }

  // Clear any pending retry timeouts
  retryTimeouts.forEach(timeout => clearTimeout(timeout))
  retryTimeouts.clear()
}

// Enhanced network status listeners with connection quality detection
let connectionQuality = 'good'

function detectConnectionQuality() {
  if ('connection' in navigator) {
    const connection = navigator.connection
    const effectiveType = connection.effectiveType

    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      connectionQuality = 'poor'
    } else if (effectiveType === '3g') {
      connectionQuality = 'moderate'
    } else {
      connectionQuality = 'good'
    }

    // Adjust sync behavior based on connection quality
    const store = useOfflineStore.getState()
    if (connectionQuality === 'poor' && store.autoSync) {
      // Reduce sync frequency on poor connections
      stopAutoSync()
      setTimeout(startAutoSync, store.syncInterval * 3)
    }
  }
}

window.addEventListener('online', () => {
  useOfflineStore.getState().setOnlineStatus(true)
  detectConnectionQuality()

  // Trigger immediate sync when coming back online
  setTimeout(() => {
    useOfflineStore.getState().processPendingChanges()
  }, 1000)
})

window.addEventListener('offline', () => {
  useOfflineStore.getState().setOnlineStatus(false)
})

// Listen for connection changes
if ('connection' in navigator) {
  navigator.connection.addEventListener('change', detectConnectionQuality)
}

// Cleanup old data on app start
setTimeout(() => {
  useOfflineStore.getState().purgeOldFailedChanges()
}, 5000)