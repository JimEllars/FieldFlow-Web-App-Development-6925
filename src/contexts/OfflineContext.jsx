import React, { createContext, useContext } from 'react'
import { useOfflineStore } from '../stores/offlineStore'

const OfflineContext = createContext({})

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (!context) {
    // Fallback to offline store if context is not available
    return useOfflineStore()
  }
  return context
}

export const OfflineProvider = ({ children }) => {
  const offlineStore = useOfflineStore()
  
  return (
    <OfflineContext.Provider value={offlineStore}>
      {children}
    </OfflineContext.Provider>
  )
}