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
    setOptimisticUpdates(prev => new Map(prev.set(id, {
      data,
      type,
      timestamp: Date.now()
    })))
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
      onError,
      priority = 'normal',
      estimatedDuration = 1000
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
        optimisticId: id,
        priority,
        estimatedDuration
      })

      // Call success callback immediately for UI feedback
      if (onSuccess) {
        onSuccess(optimisticData || data)
      }

      // Set up cleanup timer for optimistic updates
      setTimeout(() => {
        removeOptimisticUpdate(id)
      }, 30000) // Remove after 30 seconds

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

// Enhanced hook for optimistic CRUD operations
export const useOptimisticCRUD = (entity) => {
  const { performOptimisticAction } = useOptimisticUI()

  const create = useCallback((data, optimisticData, options = {}) => {
    const id = `temp-${entity}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return performOptimisticAction({
      id,
      type: 'create',
      entity,
      data,
      optimisticData: optimisticData || { ...data, id, status: 'pending' },
      ...options
    })
  }, [entity, performOptimisticAction])

  const update = useCallback((id, data, optimisticData, options = {}) => {
    return performOptimisticAction({
      id,
      type: 'update',
      entity,
      data,
      optimisticData: optimisticData || { ...data, status: 'pending' },
      ...options
    })
  }, [entity, performOptimisticAction])

  const remove = useCallback((id, options = {}) => {
    return performOptimisticAction({
      id,
      type: 'delete',
      entity,
      data: { id },
      optimisticData: { id, status: 'deleting' },
      ...options
    })
  }, [entity, performOptimisticAction])

  return { create, update, remove }
}

// Enhanced hook for managing optimistic form submissions
export const useOptimisticForm = (entity, initialValues = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const { create, update } = useOptimisticCRUD(entity)

  const submitCreate = useCallback(async (formData, options = {}) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await create(formData, null, {
        priority: options.priority || 'normal',
        onSuccess: options.onSuccess,
        onError: (error) => {
          setSubmitError(error.message)
          if (options.onError) options.onError(error)
        }
      })

      if (result.success && options.onSuccess) {
        options.onSuccess(result.data)
      }

      return result
    } finally {
      setIsSubmitting(false)
    }
  }, [create])

  const submitUpdate = useCallback(async (id, formData, options = {}) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await update(id, formData, null, {
        priority: options.priority || 'normal',
        onSuccess: options.onSuccess,
        onError: (error) => {
          setSubmitError(error.message)
          if (options.onError) options.onError(error)
        }
      })

      if (result.success && options.onSuccess) {
        options.onSuccess(result.data)
      }

      return result
    } finally {
      setIsSubmitting(false)
    }
  }, [update])

  const clearError = useCallback(() => {
    setSubmitError(null)
  }, [])

  return {
    isSubmitting,
    submitError,
    submitCreate,
    submitUpdate,
    clearError
  }
}

export default OptimisticUIProvider