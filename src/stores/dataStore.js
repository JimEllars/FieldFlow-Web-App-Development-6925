import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Sample data for testing
const sampleProjects = [
  {
    id: '1',
    name: 'Residential Deck Construction',
    description: 'Build a 20x16 composite deck with pergola and outdoor kitchen area',
    client: 'Johnson Family',
    status: 'active',
    progress: 65,
    startDate: '2024-11-01',
    endDate: '2024-12-15',
    budget: 15000,
    spent: 9750,
    address: '123 Oak Street, Springfield, IL 62701',
    team: ['Mike Rodriguez', 'Sarah Chen', 'Tom Wilson'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Commercial Landscaping Project',
    description: 'Complete landscape design and installation for new office complex',
    client: 'Springfield Business Park',
    status: 'active',
    progress: 30,
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    budget: 45000,
    spent: 13500,
    address: '456 Business Drive, Springfield, IL 62702',
    team: ['Lisa Martinez', 'David Park'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const sampleTasks = [
  {
    id: '1',
    projectId: '1',
    title: 'Install deck framing',
    description: 'Build the structural frame for the deck using pressure-treated lumber',
    status: 'completed',
    priority: 'high',
    assignee: 'Mike Rodriguez',
    dueDate: '2024-11-15',
    estimatedHours: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    projectId: '1',
    title: 'Install composite decking',
    description: 'Lay composite decking boards and secure with hidden fasteners',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    dueDate: '2024-12-01',
    estimatedHours: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Centralized data store replacing DataContext
export const useDataStore = create(
  persist(
    (set, get) => ({
      // Data state
      data: {
        projects: sampleProjects,
        tasks: sampleTasks,
        dailyLogs: [],
        timeEntries: [],
        documents: []
      },
      loading: false,
      error: null,
      lastSync: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Load all data
      loadAllData: async (userId, force = false) => {
        set({ loading: true, error: null })
        try {
          // In a real app, this would load from API
          // For now, we just use the sample data
          await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
          
          set({ 
            loading: false, 
            lastSync: new Date().toISOString() 
          })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      // Project CRUD operations
      createProject: async (projectData, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const newProject = {
            id: Date.now().toString(),
            ...projectData,
            progress: 0,
            spent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              projects: [newProject, ...state.data.projects]
            }
          }))

          if (onSuccess) onSuccess(newProject)
          return { success: true, data: newProject }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      updateProject: async (projectId, updates, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const state = get()
          const existingProject = state.data.projects.find(p => p.id === projectId)
          
          if (!existingProject) {
            throw new Error('Project not found')
          }

          const updatedProject = {
            ...existingProject,
            ...updates,
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              projects: state.data.projects.map(p => 
                p.id === projectId ? updatedProject : p
              )
            }
          }))

          if (onSuccess) onSuccess(updatedProject)
          return { success: true, data: updatedProject }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      deleteProject: async (projectId, options = {}) => {
        const { onSuccess, onError } = options
        try {
          set(state => ({
            data: {
              ...state.data,
              projects: state.data.projects.filter(p => p.id !== projectId),
              tasks: state.data.tasks.filter(t => t.projectId !== projectId),
              dailyLogs: state.data.dailyLogs.filter(d => d.projectId !== projectId),
              timeEntries: state.data.timeEntries.filter(t => t.projectId !== projectId),
              documents: state.data.documents.filter(d => d.projectId !== projectId)
            }
          }))

          if (onSuccess) onSuccess()
          return { success: true }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Task CRUD operations
      createTask: async (taskData, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const newTask = {
            id: Date.now().toString(),
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              tasks: [newTask, ...state.data.tasks]
            }
          }))

          if (onSuccess) onSuccess(newTask)
          return { success: true, data: newTask }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      updateTask: async (taskId, updates, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const state = get()
          const existingTask = state.data.tasks.find(t => t.id === taskId)
          
          if (!existingTask) {
            throw new Error('Task not found')
          }

          const updatedTask = {
            ...existingTask,
            ...updates,
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              tasks: state.data.tasks.map(t => 
                t.id === taskId ? updatedTask : t
              )
            }
          }))

          if (onSuccess) onSuccess(updatedTask)
          return { success: true, data: updatedTask }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      deleteTask: async (taskId, options = {}) => {
        const { onSuccess, onError } = options
        try {
          set(state => ({
            data: {
              ...state.data,
              tasks: state.data.tasks.filter(t => t.id !== taskId)
            }
          }))

          if (onSuccess) onSuccess()
          return { success: true }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Getter functions
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