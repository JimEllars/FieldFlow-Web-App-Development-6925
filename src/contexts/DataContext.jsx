import React, { createContext, useContext } from 'react'
import { useDataStore } from '../stores/dataStore'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    // Fallback to data store if context is not available
    return useDataStore()
  }
  return context
}

export const DataProvider = ({ children }) => {
  const dataStore = useDataStore()
  
  return (
    <DataContext.Provider value={dataStore}>
      {children}
    </DataContext.Provider>
  )
}