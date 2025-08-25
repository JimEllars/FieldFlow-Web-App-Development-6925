import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useOfflineStore } from '../stores/offlineStore'
import { useOptimisticUI } from '../components/common/OptimisticUI'
import { supabase } from '../lib/supabase'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated, testMode } = useAuth()
  const { addPendingChange, isOnline } = useOfflineStore()
  const { performOptimisticAction, getOptimisticData } = useOptimisticUI()
  
  const [data, setData] = useState({
    projects: [],
    tasks: [],
    dailyLogs: [],
    timeEntries: [],
    documents: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAllData()
    } else {
      // Clear data when user logs out
      setData({
        projects: [],
        tasks: [],
        dailyLogs: [],
        timeEntries: [],
        documents: []
      })
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      if (testMode) {
        // Test mode - load from localStorage or create demo data
        const savedData = localStorage.getItem(`fieldflow-data-${user.id}`)
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          setData(parsedData)
        } else {
          // Create demo data for test mode
          await createDemoDataTestMode()
        }
        setLoading(false)
        return
      }

      // Production mode - load from Supabase with optimistic data overlay
      const [projectsData, tasksData, dailyLogsData, timeEntriesData, documentsData] = await Promise.all([
        loadProjects(),
        loadTasks(),
        loadDailyLogs(),
        loadTimeEntries(),
        loadDocuments()
      ])

      // Apply optimistic updates to loaded data
      const optimisticProjects = applyOptimisticUpdates(projectsData || [], 'projects')
      const optimisticTasks = applyOptimisticUpdates(tasksData || [], 'tasks')
      const optimisticDailyLogs = applyOptimisticUpdates(dailyLogsData || [], 'dailyLogs')
      const optimisticTimeEntries = applyOptimisticUpdates(timeEntriesData || [], 'timeEntries')
      const optimisticDocuments = applyOptimisticUpdates(documentsData || [], 'documents')

      setData({
        projects: optimisticProjects,
        tasks: optimisticTasks,
        dailyLogs: optimisticDailyLogs,
        timeEntries: optimisticTimeEntries,
        documents: optimisticDocuments
      })

      // If this is the demo user and no data exists, create demo data
      if (user.email === 'demo@fieldflow.com' && (!projectsData || projectsData.length === 0)) {
        await createDemoData()
        // Reload data after creating demo data
        await loadAllData()
        return
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Apply optimistic updates to loaded data
  const applyOptimisticUpdates = (baseData, entityType) => {
    const optimisticUpdates = useOptimisticUI().optimisticUpdates
    let updatedData = [...baseData]

    optimisticUpdates.forEach((update, id) => {
      if (update.type === 'create' && id.startsWith(`temp-${entityType}`)) {
        // Add optimistic creates that aren't in the base data
        const exists = updatedData.some(item => item.id === id)
        if (!exists) {
          updatedData.unshift({ ...update.data, id, status: 'pending' })
        }
      } else if (update.type === 'update') {
        // Apply optimistic updates
        const index = updatedData.findIndex(item => item.id === id)
        if (index !== -1) {
          updatedData[index] = { ...updatedData[index], ...update.data, status: 'pending' }
        }
      } else if (update.type === 'delete') {
        // Apply optimistic deletes
        updatedData = updatedData.filter(item => item.id !== id)
      }
    })

    return updatedData
  }

  // Enhanced CRUD operations with optimistic UI
  const createProject = async (projectData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const optimisticProject = {
      id: `temp-projects-${Date.now()}`,
      name: projectData.name,
      description: projectData.description,
      client: projectData.client,
      status: projectData.status || 'planning',
      progress: projectData.progress || 0,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      budget: parseFloat(projectData.budget || 0),
      spent: parseFloat(projectData.spent || 0),
      address: projectData.address,
      team: projectData.team || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return performOptimisticAction({
      id: optimisticProject.id,
      type: 'create',
      entity: 'projects',
      data: projectData,
      optimisticData: optimisticProject,
      onSuccess: (result) => {
        setData(prev => ({
          ...prev,
          projects: [result, ...prev.projects.filter(p => p.id !== optimisticProject.id)]
        }))
      },
      onError: (error) => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== optimisticProject.id)
        }))
        throw error
      }
    })
  }

  const updateProject = async (projectId, updates) => {
    if (!user?.id) throw new Error('User not authenticated')

    const existingProject = data.projects.find(p => p.id === projectId)
    if (!existingProject) throw new Error('Project not found')

    const optimisticUpdate = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return performOptimisticAction({
      id: projectId,
      type: 'update',
      entity: 'projects',
      data: updates,
      optimisticData: optimisticUpdate,
      onSuccess: (result) => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id === projectId ? result : p)
        }))
      },
      onError: (error) => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id === projectId ? existingProject : p)
        }))
        throw error
      }
    })
  }

  const deleteProject = async (projectId) => {
    if (!user?.id) throw new Error('User not authenticated')

    const existingProject = data.projects.find(p => p.id === projectId)
    if (!existingProject) throw new Error('Project not found')

    return performOptimisticAction({
      id: projectId,
      type: 'delete',
      entity: 'projects',
      data: { id: projectId },
      optimisticData: { id: projectId, status: 'deleting' },
      onSuccess: () => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== projectId),
          // Also remove related tasks, logs, etc.
          tasks: prev.tasks.filter(t => t.projectId !== projectId),
          dailyLogs: prev.dailyLogs.filter(d => d.projectId !== projectId),
          timeEntries: prev.timeEntries.filter(t => t.projectId !== projectId),
          documents: prev.documents.filter(d => d.projectId !== projectId)
        }))
      },
      onError: (error) => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id === projectId ? existingProject : p)
        }))
        throw error
      }
    })
  }

  // Similar optimistic implementations for other entities
  const createTask = async (taskData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const optimisticTask = {
      id: `temp-tasks-${Date.now()}`,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      estimatedHours: parseFloat(taskData.estimatedHours || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return performOptimisticAction({
      id: optimisticTask.id,
      type: 'create',
      entity: 'tasks',
      data: taskData,
      optimisticData: optimisticTask,
      priority: taskData.priority === 'high' ? 'high' : 'normal',
      onSuccess: (result) => {
        setData(prev => ({
          ...prev,
          tasks: [result, ...prev.tasks.filter(t => t.id !== optimisticTask.id)]
        }))
      }
    })
  }

  const updateTask = async (taskId, updates) => {
    if (!user?.id) throw new Error('User not authenticated')

    const existingTask = data.tasks.find(t => t.id === taskId)
    if (!existingTask) throw new Error('Task not found')

    const optimisticUpdate = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return performOptimisticAction({
      id: taskId,
      type: 'update',
      entity: 'tasks',
      data: updates,
      optimisticData: optimisticUpdate,
      priority: updates.priority === 'high' || existingTask.priority === 'high' ? 'high' : 'normal',
      onSuccess: (result) => {
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? result : t)
        }))
      }
    })
  }

  // Create demo data for test mode (stored in localStorage)
  const createDemoDataTestMode = async () => {
    try {
      console.log('Creating demo data for test mode user:', user.id)
      const demoData = {
        projects: [
          {
            id: 'project-1',
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
            id: 'project-2',
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
        ],
        tasks: [
          {
            id: 'task-1',
            projectId: 'project-1',
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
            id: 'task-2',
            projectId: 'project-1',
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
        ],
        dailyLogs: [],
        timeEntries: [],
        documents: []
      }

      // Save to localStorage
      localStorage.setItem(`fieldflow-data-${user.id}`, JSON.stringify(demoData))
      setData(demoData)
      console.log('Demo data created for test mode')
    } catch (error) {
      console.error('Error in createDemoDataTestMode:', error)
    }
  }

  // Save data to localStorage in test mode
  const saveDataTestMode = (newData) => {
    if (testMode && user?.id) {
      localStorage.setItem(`fieldflow-data-${user.id}`, JSON.stringify(newData))
    }
  }

  // Placeholder functions for production mode
  const loadProjects = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation would go here
    return []
  }

  const loadTasks = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation would go here
    return []
  }

  const loadDailyLogs = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation would go here
    return []
  }

  const loadTimeEntries = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation would go here
    return []
  }

  const loadDocuments = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation would go here
    return []
  }

  const createDailyLog = async (logData) => {
    // Implementation similar to createTask with optimistic updates
    return null
  }

  const createTimeEntry = async (entryData) => {
    // Implementation similar to createTask with optimistic updates
    return null
  }

  // Getter functions with optimistic data consideration
  const getProjectById = (id) => {
    const optimisticData = getOptimisticData(id)
    if (optimisticData && optimisticData.type !== 'delete') {
      return { ...data.projects.find(p => p.id === id), ...optimisticData.data }
    }
    return data.projects.find(p => p.id === id)
  }

  const getTaskById = (id) => {
    const optimisticData = getOptimisticData(id)
    if (optimisticData && optimisticData.type !== 'delete') {
      return { ...data.tasks.find(t => t.id === id), ...optimisticData.data }
    }
    return data.tasks.find(t => t.id === id)
  }

  const getTasksByProject = (projectId) => data.tasks.filter(t => t.projectId === projectId)
  const getDailyLogsByProject = (projectId) => data.dailyLogs.filter(d => d.projectId === projectId)
  const getTimeEntriesByProject = (projectId) => data.timeEntries.filter(t => t.projectId === projectId)
  const getDocumentsByProject = (projectId) => data.documents.filter(d => d.projectId === projectId)
  const getDocumentById = (id) => data.documents.find(d => d.id === id)

  const value = {
    data,
    loading,
    error,
    
    // Data loading
    loadAllData,
    
    // Getters
    getProjectById,
    getTaskById,
    getTasksByProject,
    getDailyLogsByProject,
    getTimeEntriesByProject,
    getDocumentsByProject,
    getDocumentById,
    
    // CRUD operations with optimistic UI
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    createTimeEntry,
    createDailyLog,
    
    // Utility
    testMode
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}