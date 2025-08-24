import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOffline } from './OfflineContext'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Mock data for development
const generateMockData = () => ({
  projects: [
    {
      id: '1',
      name: 'Downtown Office Complex',
      status: 'active',
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      budget: 850000,
      spent: 552500,
      address: '123 Main St, Downtown',
      description: 'Modern 5-story office building with retail space',
      client: 'Metro Development Corp',
      team: ['John Smith', 'Sarah Johnson', 'Mike Wilson']
    },
    {
      id: '2',
      name: 'Residential Subdivision',
      status: 'planning',
      progress: 15,
      startDate: '2024-03-01',
      endDate: '2024-12-15',
      budget: 1200000,
      spent: 180000,
      address: '456 Oak Avenue, Suburbia',
      description: '24-unit residential development',
      client: 'Hometown Builders',
      team: ['Lisa Brown', 'Tom Davis']
    }
  ],
  tasks: [
    {
      id: '1',
      projectId: '1',
      title: 'Foundation Inspection',
      description: 'Complete foundation inspection before concrete pour',
      status: 'pending',
      priority: 'high',
      assignee: 'John Smith',
      dueDate: '2024-01-25',
      createdAt: '2024-01-20',
      estimatedHours: 4
    },
    {
      id: '2',
      projectId: '1',
      title: 'Electrical Rough-in',
      description: 'Install electrical rough-in for floors 1-3',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Mike Wilson',
      dueDate: '2024-01-28',
      createdAt: '2024-01-18',
      estimatedHours: 16
    }
  ],
  dailyLogs: [
    {
      id: '1',
      projectId: '1',
      date: '2024-01-24',
      weather: 'Sunny, 45°F',
      crew: ['John Smith', 'Mike Wilson', 'Tom Davis'],
      workCompleted: 'Completed foundation inspection, started electrical rough-in prep',
      materials: [
        { item: 'Electrical conduit', quantity: 50, unit: 'ft' },
        { item: 'Wire nuts', quantity: 100, unit: 'pcs' }
      ],
      equipment: ['Excavator', 'Concrete mixer'],
      notes: 'Foundation passed inspection. Electrical crew arrives tomorrow.',
      photos: [],
      submittedBy: 'John Smith',
      submittedAt: '2024-01-24T17:30:00Z'
    }
  ],
  timeEntries: [
    {
      id: '1',
      projectId: '1',
      userId: 'john-smith',
      date: '2024-01-24',
      clockIn: '07:00:00',
      clockOut: '15:30:00',
      breakTime: 30,
      totalHours: 8,
      description: 'Foundation inspection and site prep',
      location: { lat: 40.7128, lng: -74.0060 }
    }
  ],
  documents: [
    {
      id: '1',
      projectId: '1',
      name: 'Site Plans - Rev 3',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-20T10:00:00Z',
      uploadedBy: 'Sarah Johnson',
      url: 'https://example.com/plans.pdf',
      category: 'drawings'
    },
    {
      id: '2',
      projectId: '1',
      name: 'Building Permit',
      type: 'pdf',
      size: '1.1 MB',
      uploadedAt: '2024-01-15T14:30:00Z',
      uploadedBy: 'John Smith',
      url: 'https://example.com/permit.pdf',
      category: 'permits'
    }
  ]
})

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    projects: [],
    tasks: [],
    dailyLogs: [],
    timeEntries: [],
    documents: []
  })
  const [loading, setLoading] = useState(true)
  const { addPendingChange, isOnline } = useOffline()

  useEffect(() => {
    // Load data from localStorage or initialize with mock data
    const loadData = () => {
      try {
        const stored = localStorage.getItem('fieldflow-app-data')
        if (stored) {
          setData(JSON.parse(stored))
        } else {
          // Initialize with mock data for development
          const mockData = generateMockData()
          setData(mockData)
          localStorage.setItem('fieldflow-app-data', JSON.stringify(mockData))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to mock data
        const mockData = generateMockData()
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const saveData = (newData) => {
    try {
      localStorage.setItem('fieldflow-app-data', JSON.stringify(newData))
      setData(newData)
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  // Generic CRUD operations
  const createItem = (collection, item) => {
    const newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item
    }
    
    const newData = {
      ...data,
      [collection]: [...data[collection], newItem]
    }
    
    saveData(newData)
    
    // Add to pending changes for sync
    addPendingChange({
      action: 'create',
      collection,
      data: newItem
    })
    
    return newItem
  }

  const updateItem = (collection, id, updates) => {
    const newData = {
      ...data,
      [collection]: data[collection].map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    }
    
    saveData(newData)
    
    addPendingChange({
      action: 'update',
      collection,
      id,
      data: updates
    })
    
    return newData[collection].find(item => item.id === id)
  }

  const deleteItem = (collection, id) => {
    const newData = {
      ...data,
      [collection]: data[collection].filter(item => item.id !== id)
    }
    
    saveData(newData)
    
    addPendingChange({
      action: 'delete',
      collection,
      id
    })
  }

  // Specific data operations
  const getProjectById = (id) => data.projects.find(p => p.id === id)
  const getTaskById = (id) => data.tasks.find(t => t.id === id)
  const getTasksByProject = (projectId) => data.tasks.filter(t => t.projectId === projectId)
  const getDailyLogsByProject = (projectId) => data.dailyLogs.filter(d => d.projectId === projectId)
  const getTimeEntriesByProject = (projectId) => data.timeEntries.filter(t => t.projectId === projectId)
  const getDocumentsByProject = (projectId) => data.documents.filter(d => d.projectId === projectId)

  const createProject = (projectData) => createItem('projects', projectData)
  const updateProject = (id, updates) => updateItem('projects', id, updates)
  const deleteProject = (id) => deleteItem('projects', id)

  const createTask = (taskData) => createItem('tasks', taskData)
  const updateTask = (id, updates) => updateItem('tasks', id, updates)
  const deleteTask = (id) => deleteItem('tasks', id)

  const createDailyLog = (logData) => createItem('dailyLogs', logData)
  const updateDailyLog = (id, updates) => updateItem('dailyLogs', id, updates)

  const createTimeEntry = (entryData) => createItem('timeEntries', entryData)
  const updateTimeEntry = (id, updates) => updateItem('timeEntries', id, updates)

  const uploadDocument = (docData) => createItem('documents', docData)
  const deleteDocument = (id) => deleteItem('documents', id)

  const value = {
    data,
    loading,
    
    // Generic operations
    createItem,
    updateItem,
    deleteItem,
    
    // Getters
    getProjectById,
    getTaskById,
    getTasksByProject,
    getDailyLogsByProject,
    getTimeEntriesByProject,
    getDocumentsByProject,
    
    // Projects
    createProject,
    updateProject,
    deleteProject,
    
    // Tasks
    createTask,
    updateTask,
    deleteTask,
    
    // Daily Logs
    createDailyLog,
    updateDailyLog,
    
    // Time Entries
    createTimeEntry,
    updateTimeEntry,
    
    // Documents
    uploadDocument,
    deleteDocument
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}