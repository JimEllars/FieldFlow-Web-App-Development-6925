import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Enhanced sample data for better demo experience
const sampleProjects = [
  {
    id: '1',
    name: 'Residential Deck Construction',
    description: 'Build a 20x16 composite deck with pergola and outdoor kitchen area',
    client: 'Johnson Family',
    client_id: 'client-1',
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
    client_id: 'client-2',
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
  },
  {
    id: '3',
    name: 'Kitchen Renovation',
    description: 'Complete kitchen remodel with custom cabinets and granite countertops',
    client: 'Smith Residence',
    client_id: 'client-3',
    status: 'planning',
    progress: 10,
    startDate: '2025-01-15',
    endDate: '2025-03-30',
    budget: 35000,
    spent: 3500,
    address: '789 Maple Ave, Springfield, IL 62703',
    team: ['John Davis', 'Emma Wilson'],
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
  },
  {
    id: '3',
    projectId: '2',
    title: 'Site preparation',
    description: 'Clear and level the construction site for landscaping',
    status: 'pending',
    priority: 'medium',
    assignee: 'Lisa Martinez',
    dueDate: '2024-12-10',
    estimatedHours: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const sampleClients = [
  {
    id: 'client-1',
    name: 'Johnson Family',
    email: 'sarah.johnson@email.com',
    phone_number: '(555) 123-4567',
    address: '123 Oak Street, Springfield, IL 62701',
    notes: 'Preferred client - always pays on time. Interested in future landscaping projects.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'client-2',
    name: 'Springfield Business Park',
    email: 'maintenance@springfieldpark.com',
    phone_number: '(555) 987-6543',
    address: '456 Business Drive, Springfield, IL 62702',
    notes: 'Commercial client - requires all work to be completed after business hours.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'client-3',
    name: 'Smith Residence',
    email: 'mike.smith@email.com',
    phone_number: '(555) 555-0123',
    address: '789 Maple Ave, Springfield, IL 62703',
    notes: 'New client - referred by Johnson Family. Very detail-oriented.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const sampleDailyLogs = [
  {
    id: '1',
    projectId: '1',
    date: '2024-11-20',
    weather: 'Sunny, 68°F',
    workCompleted: 'Completed installation of deck joists and began laying composite boards. Made excellent progress on the main deck area.',
    notes: 'Client was very pleased with progress. Need to order additional screws for tomorrow.',
    crew: ['Mike Rodriguez', 'Sarah Chen'],
    materials: [
      { item: 'Composite Decking Boards', quantity: '24', unit: 'pieces' },
      { item: 'Deck Screws', quantity: '2', unit: 'lbs' }
    ],
    equipment: ['Circular Saw', 'Drill', 'Level'],
    submittedBy: 'Mike Rodriguez',
    submittedAt: '2024-11-20T17:30:00.000Z'
  },
  {
    id: '2',
    projectId: '2',
    date: '2024-11-19',
    weather: 'Partly cloudy, 72°F',
    workCompleted: 'Site preparation completed. Removed existing vegetation and graded the area for new landscaping.',
    notes: 'Irrigation lines marked and protected. Ready for next phase.',
    crew: ['Lisa Martinez', 'David Park'],
    materials: [
      { item: 'Topsoil', quantity: '5', unit: 'yards' }
    ],
    equipment: ['Bobcat', 'Hand tools'],
    submittedBy: 'Lisa Martinez',
    submittedAt: '2024-11-19T16:45:00.000Z'
  }
]

const sampleTimeEntries = [
  {
    id: '1',
    projectId: '1',
    date: '2024-11-20',
    clockIn: '07:30:00',
    clockOut: '16:30:00',
    totalHours: 8.5,
    description: 'Deck construction - installed framing and started decking boards'
  },
  {
    id: '2',
    projectId: '1',
    date: '2024-11-19',
    clockIn: '08:00:00',
    clockOut: '17:00:00',
    totalHours: 8.0,
    description: 'Prepared deck foundation and installed support posts'
  },
  {
    id: '3',
    projectId: '2',
    date: '2024-11-19',
    clockIn: '07:00:00',
    clockOut: '15:30:00',
    totalHours: 7.5,
    description: 'Site preparation and landscaping layout'
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
        clients: sampleClients,
        dailyLogs: sampleDailyLogs,
        timeEntries: sampleTimeEntries,
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
          set({ loading: false, lastSync: new Date().toISOString() })
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

      // Daily log CRUD operations
      createDailyLog: async (logData, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const newLog = {
            id: Date.now().toString(),
            ...logData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              dailyLogs: [newLog, ...state.data.dailyLogs]
            }
          }))

          if (onSuccess) onSuccess(newLog)
          return { success: true, data: newLog }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Time entry CRUD operations
      createTimeEntry: async (entryData, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const newEntry = {
            id: Date.now().toString(),
            ...entryData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              timeEntries: [newEntry, ...state.data.timeEntries]
            }
          }))

          if (onSuccess) onSuccess(newEntry)
          return { success: true, data: newEntry }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      // Client CRUD operations
      createClient: async (clientData, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const newClient = {
            id: `client-${Date.now()}`,
            ...clientData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              clients: [newClient, ...state.data.clients]
            }
          }))

          if (onSuccess) onSuccess(newClient)
          return { success: true, data: newClient }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      updateClient: async (clientId, updates, options = {}) => {
        const { onSuccess, onError } = options
        try {
          const state = get()
          const existingClient = state.data.clients.find(c => c.id === clientId)
          
          if (!existingClient) {
            throw new Error('Client not found')
          }

          const updatedClient = {
            ...existingClient,
            ...updates,
            updated_at: new Date().toISOString()
          }

          set(state => ({
            data: {
              ...state.data,
              clients: state.data.clients.map(c => 
                c.id === clientId ? updatedClient : c
              )
            }
          }))

          if (onSuccess) onSuccess(updatedClient)
          return { success: true, data: updatedClient }
        } catch (error) {
          if (onError) onError(error)
          throw error
        }
      },

      deleteClient: async (clientId, options = {}) => {
        const { onSuccess, onError } = options
        try {
          set(state => ({
            data: {
              ...state.data,
              clients: state.data.clients.filter(c => c.id !== clientId),
              // Also update projects to remove client reference
              projects: state.data.projects.map(p => 
                p.client_id === clientId ? { ...p, client_id: null } : p
              )
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

      getClientById: (id) => {
        const state = get()
        return state.data.clients.find(c => c.id === id)
      },

      getTasksByProject: (projectId) => {
        const state = get()
        return state.data.tasks.filter(t => t.projectId === projectId)
      },

      getProjectsByClient: (clientId) => {
        const state = get()
        return state.data.projects.filter(p => p.client_id === clientId)
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