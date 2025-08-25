import React, { createContext, useContext, useState, useCallback } from 'react'
import { useOfflineStore } from '../../stores/offlineStore'

const OptimisticUIContext = createContext()

export const useOptimisticUI = () => {
  const context = useContext(OptimisticUIContext)
  if (!context) {
    throw new Error('useOptimisticUI must be used within OptimisticUIProvider')
  }
  return context
}

export const OptimisticUIProvider = ({ children }) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map())
  const addPendingChange = useOfflineStore(state => state.addPendingChange)

  const addOptimisticUpdate = useCallback((id, data, type = 'update') => {
    setOptimisticUpdates(prev => new Map(prev.set(id, { data, type, timestamp: Date.now() })))
  }, [])

  const removeOptimisticUpdate = useCallback((id) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const getOptimisticData = useCallback((id) => {
    return optimisticUpdates.get(id)
  }, [optimisticUpdates])

  const performOptimisticAction = useCallback(async (action) => {
    const { 
      id, 
      type, 
      entity, 
      data, 
      optimisticData, 
      onSuccess, 
      onError 
    } = action

    try {
      // Add optimistic update immediately
      if (optimisticData) {
        addOptimisticUpdate(id, optimisticData, type)
      }

      // Add to offline queue for eventual consistency
      addPendingChange({
        type,
        entity,
        id,
        data,
        optimisticId: id
      })

      // Call success callback immediately for UI feedback
      if (onSuccess) {
        onSuccess(optimisticData || data)
      }

      return { success: true, data: optimisticData || data }
    } catch (error) {
      // Remove optimistic update on error
      removeOptimisticUpdate(id)
      
      if (onError) {
        onError(error)
      }
      
      return { success: false, error }
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate, addPendingChange])

  const value = {
    optimisticUpdates,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    getOptimisticData,
    performOptimisticAction
  }

  return (
    <OptimisticUIContext.Provider value={value}>
      {children}
    </OptimisticUIContext.Provider>
  )
}

// Higher-order component for optimistic updates
export const withOptimisticUI = (WrappedComponent) => {
  return function OptimisticComponent(props) {
    return (
      <OptimisticUIProvider>
        <WrappedComponent {...props} />
      </OptimisticUIProvider>
    )
  }
}

// Hook for optimistic CRUD operations
export const useOptimisticCRUD = (entity) => {
  const { performOptimisticAction } = useOptimisticUI()

  const create = useCallback((data, optimisticData) => {
    const id = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return performOptimisticAction({
      id,
      type: 'create',
      entity,
      data,
      optimisticData: optimisticData || { ...data, id, status: 'pending' }
    })
  }, [entity, performOptimisticAction])

  const update = useCallback((id, data, optimisticData) => {
    return performOptimisticAction({
      id,
      type: 'update',
      entity,
      data,
      optimisticData: optimisticData || { ...data, status: 'pending' }
    })
  }, [entity, performOptimisticAction])

  const remove = useCallback((id) => {
    return performOptimisticAction({
      id,
      type: 'delete',
      entity,
      data: { id },
      optimisticData: { id, status: 'deleting' }
    })
  }, [entity, performOptimisticAction])

  return { create, update, remove }
}