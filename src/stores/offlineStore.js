import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Offline store for managing offline state and sync queue
export const useOfflineStore = create(
  persist(
    (set, get) => ({
      // Connection state
      isOnline: navigator.onLine,
      lastSync: null,
      syncInProgress: false,
      
      // Offline queue
      pendingChanges: [],
      failedChanges: [],
      
      // Settings
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      
      // Actions
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      addPendingChange: (change) => set((state) => {
        const changeWithId = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          retryCount: 0,
          ...change
        }
        return {
          ...state,
          pendingChanges: [...state.pendingChanges, changeWithId]
        }
      }),
      
      removePendingChange: (changeId) => set((state) => ({
        ...state,
        pendingChanges: state.pendingChanges.filter(change => change.id !== changeId)
      })),
      
      movePendingToFailed: (changeId, error) => set((state) => {
        const changeIndex = state.pendingChanges.findIndex(change => change.id === changeId)
        if (changeIndex !== -1) {
          const change = { ...state.pendingChanges[changeIndex] }
          change.error = error
          change.retryCount += 1
          
          const newPendingChanges = [...state.pendingChanges]
          newPendingChanges.splice(changeIndex, 1)
          
          return {
            ...state,
            pendingChanges: newPendingChanges,
            failedChanges: [...state.failedChanges, change]
          }
        }
        return state
      }),
      
      retryFailedChange: (changeId) => set((state) => {
        const changeIndex = state.failedChanges.findIndex(change => change.id === changeId)
        if (changeIndex !== -1) {
          const change = state.failedChanges[changeIndex]
          if (change.retryCount < 3) { // Max 3 retries
            const newFailedChanges = [...state.failedChanges]
            newFailedChanges.splice(changeIndex, 1)
            
            return {
              ...state,
              pendingChanges: [...state.pendingChanges, change],
              failedChanges: newFailedChanges
            }
          }
        }
        return state
      }),
      
      clearFailedChanges: () => set((state) => ({ ...state, failedChanges: [] })),
      
      setSyncInProgress: (inProgress) => set((state) => ({ ...state, syncInProgress: inProgress })),
      
      setLastSync: (timestamp) => set((state) => ({ ...state, lastSync: timestamp })),
      
      // Sync operations
      processPendingChanges: async () => {
        const { pendingChanges, isOnline } = get()
        
        if (!isOnline || pendingChanges.length === 0) {
          return { success: true, processed: 0 }
        }
        
        set((state) => ({ ...state, syncInProgress: true }))
        
        let processed = 0
        let failed = 0
        
        for (const change of pendingChanges) {
          try {
            await executeChange(change)
            get().removePendingChange(change.id)
            processed++
          } catch (error) {
            console.error('Failed to sync change:', error)
            get().movePendingToFailed(change.id, error.message)
            failed++
          }
        }
        
        set((state) => ({ 
          ...state,
          syncInProgress: false, 
          lastSync: new Date().toISOString() 
        }))
        
        return { success: failed === 0, processed, failed }
      },
      
      // Get sync status
      getSyncStatus: () => {
        const { pendingChanges, failedChanges, syncInProgress, lastSync } = get()
        return {
          pendingCount: pendingChanges.length,
          failedCount: failedChanges.length,
          syncInProgress,
          lastSync,
          hasChanges: pendingChanges.length > 0 || failedChanges.length > 0
        }
      }
    }),
    {
      name: 'fieldflow-offline-store',
      partialize: (state) => ({
        pendingChanges: state.pendingChanges,
        failedChanges: state.failedChanges,
        lastSync: state.lastSync,
        autoSync: state.autoSync,
        syncInterval: state.syncInterval
      })
    }
  )
)

// Helper function to execute a change
async function executeChange(change) {
  const { type, entity, data, id } = change
  
  // Import services dynamically to avoid circular dependencies
  try {
    const { services } = await import('../services/supabaseService')
    
    switch (type) {
      case 'create':
        return await services[entity].create(data)
      
      case 'update':
        return await services[entity].update(id, data)
      
      case 'delete':
        return await services[entity].delete(id)
      
      default:
        throw new Error(`Unknown change type: ${type}`)
    }
  } catch (error) {
    console.error('Error executing change:', error)
    throw error
  }
}

// Auto-sync functionality
let syncInterval = null

export const startAutoSync = () => {
  const { autoSync, syncInterval: interval, processPendingChanges } = useOfflineStore.getState()
  
  if (!autoSync || syncInterval) return
  
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      processPendingChanges()
    }
  }, interval)
}

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

// Network status listeners
window.addEventListener('online', () => {
  useOfflineStore.getState().setOnlineStatus(true)
  // Trigger immediate sync when coming back online
  setTimeout(() => {
    useOfflineStore.getState().processPendingChanges()
  }, 1000)
})

window.addEventListener('offline', () => {
  useOfflineStore.getState().setOnlineStatus(false)
})