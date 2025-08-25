import React, { createContext, useContext, useState, useEffect } from 'react'

const OfflineContext = createContext({})

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, error
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync when coming back online
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('idle')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for pending changes on load
    const stored = localStorage.getItem('fieldflow-pending-changes')
    if (stored) {
      try {
        const changes = JSON.parse(stored)
        setPendingChanges(changes.length || 0)
      } catch (error) {
        console.error('Error parsing pending changes:', error)
      }
    }

    const lastSyncTime = localStorage.getItem('fieldflow-last-sync')
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const triggerSync = async () => {
    if (!isOnline || syncStatus === 'syncing') return

    try {
      setSyncStatus('syncing')

      // Get pending changes from localStorage
      const stored = localStorage.getItem('fieldflow-pending-changes')
      if (!stored) {
        setSyncStatus('idle')
        return
      }

      const changes = JSON.parse(stored)
      if (changes.length === 0) {
        setSyncStatus('idle')
        return
      }

      // Simulate API sync - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clear pending changes after successful sync
      localStorage.removeItem('fieldflow-pending-changes')
      setPendingChanges(0)

      const now = new Date()
      setLastSync(now)
      localStorage.setItem('fieldflow-last-sync', now.toISOString())

      setSyncStatus('idle')
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
    }
  }

  const addPendingChange = (change) => {
    try {
      const stored = localStorage.getItem('fieldflow-pending-changes')
      const changes = stored ? JSON.parse(stored) : []

      const newChange = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...change
      }

      changes.push(newChange)
      localStorage.setItem('fieldflow-pending-changes', JSON.stringify(changes))
      setPendingChanges(changes.length)

      // Try to sync if online
      if (isOnline) {
        triggerSync()
      }
    } catch (error) {
      console.error('Error adding pending change:', error)
    }
  }

  const clearPendingChanges = () => {
    localStorage.removeItem('fieldflow-pending-changes')
    setPendingChanges(0)
  }

  const value = {
    isOnline,
    syncStatus,
    pendingChanges,
    lastSync,
    triggerSync,
    addPendingChange,
    clearPendingChanges
  }

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  )
}