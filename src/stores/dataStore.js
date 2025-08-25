import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { services } from '../services/supabaseService'
import { useOfflineStore } from './offlineStore'

// Centralized data store replacing DataContext
export const useDataStore = create(
  persist(
    (set, get) => ({
      // Data state
      data: {
        projects: [],
        tasks: [],
        dailyLogs: [],
        timeEntries: [],
        documents: []
      },
      loading: false,
      error: null,
      lastSync: null,

      // Cache management
      cache: new Map(),
      cacheExpiry: 5 * 60 * 1000, // 5 minutes

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Enhanced data loading with intelligent caching
      loadAllData: async (userId, force = false) => {
        const state = get()
        
        // Check cache first unless force refresh
        const cacheKey = `all-data-${userId}`
        const cached = state.cache.get(cacheKey)
        const now = Date.now()
        
        if (!force && cached && (now - cached.timestamp) < state.cacheExpiry) {
          set({ data: cached.data, loading: false })
          return cached.data
        }

        set({ loading: true, error: null })

        try {
          // Load data in parallel with error handling
          const [projects, tasks, dailyLogs, timeEntries, documents] = await Promise.allSettled([
            services.projects.getProjectsWithStats(userId),
            services.tasks.getAll(userId),
            services.dailyLogs.getAll(userId),
            services.timeEntries.getAll(userId),
            services.documents.getAll(userId)
          ])

          // Process results and handle partial failures gracefully
          const newData = {
            projects: projects.status === 'fulfilled' ? projects.value : [],
            tasks: tasks.status === 'fulfilled' ? tasks.value : [],
            dailyLogs: dailyLogs.status === 'fulfilled' ? dailyLogs.value : [],
            timeEntries: timeEntries.status === 'fulfilled' ? timeEntries.value : [],
            documents: documents.status === 'fulfilled' ? documents.value : []
          }

          // Update cache
          state.cache.set(cacheKey, {
            data: newData,
            timestamp: now
          })

          set({ 
            data: newData, 
            loading: false, 
            lastSync: new Date().toISOString() 
          })

          // Log any partial failures
          const failures = [projects, tasks, dailyLogs, timeEntries, documents]
            .filter(result => result.status === 'rejected')
          
          if (failures.length > 0) {
            console.warn('Some data failed to load:', failures)
          }

          return newData
        } catch (error) {
          console.error('Error loading data:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Optimistic CRUD operations with enhanced error handling
      createProject: async (projectData, options = {}) => {
        const { userId, onSuccess, onError, priority = 'high' } = options
        
        try {
          // Generate optimistic ID
          const optimisticId = `temp-project-${Date.now()}`
          const optimisticProject = {
            id: optimisticId,
            ...projectData,
            progress: 0,
            spent: 0,
            taskCount: 0,
            completedTasks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Add optimistically to store
          set(state => ({
            data: {
              ...state.data,
              projects: [optimisticProject, ...state.data.projects]
            }
          }))

          // Add to offline queue
          useOfflineStore.getState().addPendingChange({
            type: 'create',
            entity: 'projects',
            data: projectData,
            optimisticId,
            priority,
            userId
          })

          // Call success callback immediately
          if (onSuccess) onSuccess(optimisticProject)

          return { success: true, data: optimisticProject }
        } catch (error) {
          // Remove optimistic update on error
          set(state => ({
            data: {
              ...state.data,
              projects: state.data.projects.filter(p => !p.id.startsWith('temp-'))
            }
          }))
          
          if (onError) onError(error)
          throw error
        }
      },

      updateProject: async (projectId, updates, options = {}) => {
        const { onSuccess, onError, priority = 'normal' } = options
        
        try {
          const state = get()
          const existingProject = state.data.projects.find(p => p.id === projectId)
          
          if (!existingProject) {
            throw new Error('Project not found')
          }

          const optimisticUpdate = {
            ...existingProject,
            ...updates,
            updatedAt: new Date().toISOString()
          }

          // Update optimistically
          set(state => ({
            data: {
              ...state.data,
              projects: state.data.projects.map(p => 
                p.id === projectId ? optimisticUpdate : p
              )
            }
          }))

          // Add to offline queue
          useOfflineStore.getState().addPendingChange({
            type: 'update',
            entity: 'projects',
            id: projectId,
            data: updates,
            priority
          })

          if (onSuccess) onSuccess(optimisticUpdate)
          return { success: true, data: optimisticUpdate }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      deleteProject: async (projectId, options = {}) => {
        const { onSuccess, onError, priority = 'normal' } = options
        
        try {
          const state = get()
          const projectToDelete = state.data.projects.find(p => p.id === projectId)
          
          if (!projectToDelete) {
            throw new Error('Project not found')
          }

          // Remove optimistically
          set(state => ({
            data: {
              ...state.data,
              projects: state.data.projects.filter(p => p.id !== projectId),
              // Also remove related data
              tasks: state.data.tasks.filter(t => t.projectId !== projectId),
              dailyLogs: state.data.dailyLogs.filter(d => d.projectId !== projectId),
              timeEntries: state.data.timeEntries.filter(t => t.projectId !== projectId),
              documents: state.data.documents.filter(d => d.projectId !== projectId)
            }
          }))

          // Add to offline queue
          useOfflineStore.getState().addPendingChange({
            type: 'delete',
            entity: 'projects',
            id: projectId,
            priority
          })

          if (onSuccess) onSuccess()
          return { success: true }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Similar optimistic operations for other entities
      createTask: async (taskData, options = {}) => {
        const { onSuccess, onError, priority = 'normal' } = options
        
        try {
          const optimisticId = `temp-task-${Date.now()}`
          const optimisticTask = {
            id: optimisticId,
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              tasks: [optimisticTask, ...state.data.tasks]
            }
          }))

          useOfflineStore.getState().addPendingChange({
            type: 'create',
            entity: 'tasks',
            data: taskData,
            optimisticId,
            priority: taskData.priority === 'high' ? 'high' : priority
          })

          if (onSuccess) onSuccess(optimisticTask)
          return { success: true, data: optimisticTask }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      updateTask: async (taskId, updates, options = {}) => {
        const { onSuccess, onError, priority = 'normal' } = options
        
        try {
          const state = get()
          const existingTask = state.data.tasks.find(t => t.id === taskId)
          
          if (!existingTask) {
            throw new Error('Task not found')
          }

          const optimisticUpdate = {
            ...existingTask,
            ...updates,
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              tasks: state.data.tasks.map(t => 
                t.id === taskId ? optimisticUpdate : t
              )
            }
          }))

          useOfflineStore.getState().addPendingChange({
            type: 'update',
            entity: 'tasks',
            id: taskId,
            data: updates,
            priority: updates.priority === 'high' || existingTask.priority === 'high' ? 'high' : priority
          })

          if (onSuccess) onSuccess(optimisticUpdate)
          return { success: true, data: optimisticUpdate }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      deleteTask: async (taskId, options = {}) => {
        const { onSuccess, onError, priority = 'normal' } = options
        
        try {
          set(state => ({
            data: {
              ...state.data,
              tasks: state.data.tasks.filter(t => t.id !== taskId)
            }
          }))

          useOfflineStore.getState().addPendingChange({
            type: 'delete',
            entity: 'tasks',
            id: taskId,
            priority
          })

          if (onSuccess) onSuccess()
          return { success: true }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Getter functions with caching
      getProjectById: (id) => {
        const state = get()
        return state.data.projects.find(p => p.id === id)
      },

      getTaskById: (id) => {
        const state = get()
        return state.data.tasks.find(t => t.id === id)
      },

      getTasksByProject: (projectId) => {
        const state = get()
        return state.data.tasks.filter(t => t.projectId === projectId)
      },

      getDailyLogsByProject: (projectId) => {
        const state = get()
        return state.data.dailyLogs.filter(d => d.projectId === projectId)
      },

      getTimeEntriesByProject: (projectId) => {
        const state = get()
        return state.data.timeEntries.filter(t => t.projectId === projectId)
      },

      getDocumentsByProject: (projectId) => {
        const state = get()
        return state.data.documents.filter(d => d.projectId === projectId)
      },

      getDocumentById: (id) => {
        const state = get()
        return state.data.documents.find(d => d.id === id)
      },

      // Cache management
      clearCache: () => {
        set(state => {
          state.cache.clear()
          return { cache: new Map() }
        })
      },

      // Pull to refresh functionality
      pullToRefresh: async (userId) => {
        const state = get()
        return state.loadAllData(userId, true) // Force refresh
      }
    }),
    {
      name: 'fieldflow-data-store',
      partialize: (state) => ({
        data: state.data,
        lastSync: state.lastSync
      })
    }
  )
)

export default useDataStore