import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useOffline } from './OfflineContext'
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
  const { user, isAuthenticated } = useAuth()
  const { addPendingChange, isOnline } = useOffline()
  
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

      // Load all data in parallel
      const [projectsData, tasksData, dailyLogsData, timeEntriesData, documentsData] = await Promise.all([
        loadProjects(),
        loadTasks(),
        loadDailyLogs(),
        loadTimeEntries(),
        loadDocuments()
      ])

      setData({
        projects: projectsData || [],
        tasks: tasksData || [],
        dailyLogs: dailyLogsData || [],
        timeEntries: timeEntriesData || [],
        documents: documentsData || []
      })
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Projects operations
  const loadProjects = async () => {
    if (!user?.id) return []

    const { data: projects, error } = await supabase
      .from('projects_ff2024')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      client: project.client,
      status: project.status,
      progress: project.progress,
      startDate: project.start_date,
      endDate: project.end_date,
      budget: parseFloat(project.budget || 0),
      spent: parseFloat(project.spent || 0),
      address: project.address,
      team: project.team || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }))
  }

  const createProject = async (projectData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('projects_ff2024')
      .insert({
        user_id: user.id,
        name: projectData.name,
        description: projectData.description,
        client: projectData.client,
        status: projectData.status || 'planning',
        progress: projectData.progress || 0,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        budget: projectData.budget || 0,
        spent: projectData.spent || 0,
        address: projectData.address,
        team: projectData.team || []
      })
      .select()
      .single()

    if (error) throw error

    const newProject = {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      status: data.status,
      progress: data.progress,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: parseFloat(data.budget || 0),
      spent: parseFloat(data.spent || 0),
      address: data.address,
      team: data.team || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    setData(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects]
    }))

    return newProject
  }

  const updateProject = async (id, updates) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('projects_ff2024')
      .update({
        name: updates.name,
        description: updates.description,
        client: updates.client,
        status: updates.status,
        progress: updates.progress,
        start_date: updates.startDate,
        end_date: updates.endDate,
        budget: updates.budget,
        spent: updates.spent,
        address: updates.address,
        team: updates.team,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    const updatedProject = {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      status: data.status,
      progress: data.progress,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: parseFloat(data.budget || 0),
      spent: parseFloat(data.spent || 0),
      address: data.address,
      team: data.team || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? updatedProject : p)
    }))

    return updatedProject
  }

  const deleteProject = async (id) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('projects_ff2024')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.filter(t => t.projectId !== id),
      dailyLogs: prev.dailyLogs.filter(dl => dl.projectId !== id),
      timeEntries: prev.timeEntries.filter(te => te.projectId !== id),
      documents: prev.documents.filter(d => d.projectId !== id)
    }))
  }

  // Tasks operations
  const loadTasks = async () => {
    if (!user?.id) return []

    const { data: tasks, error } = await supabase
      .from('tasks_ff2024')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) throw error
    
    return tasks.map(task => ({
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.due_date,
      estimatedHours: task.estimated_hours,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }))
  }

  const createTask = async (taskData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks_ff2024')
      .insert({
        project_id: taskData.projectId,
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        assignee: taskData.assignee,
        due_date: taskData.dueDate,
        estimated_hours: taskData.estimatedHours || 0
      })
      .select()
      .single()

    if (error) throw error

    const newTask = {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.due_date,
      estimatedHours: data.estimated_hours,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))

    return newTask
  }

  const updateTask = async (id, updates) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks_ff2024')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assignee: updates.assignee,
        due_date: updates.dueDate,
        estimated_hours: updates.estimatedHours,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    const updatedTask = {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.due_date,
      estimatedHours: data.estimated_hours,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? updatedTask : t)
    }))

    return updatedTask
  }

  const deleteTask = async (id) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('tasks_ff2024')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }))
  }

  // Daily logs operations
  const loadDailyLogs = async () => {
    if (!user?.id) return []

    const { data: dailyLogs, error } = await supabase
      .from('daily_logs_ff2024')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) throw error
    
    return dailyLogs.map(log => ({
      id: log.id,
      projectId: log.project_id,
      date: log.date,
      weather: log.weather,
      workCompleted: log.work_completed,
      notes: log.notes,
      crew: log.crew || [],
      materials: log.materials || [],
      equipment: log.equipment || [],
      photos: log.photos || [],
      submittedBy: log.submitted_by,
      submittedAt: log.submitted_at,
      createdAt: log.created_at
    }))
  }

  const createDailyLog = async (logData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('daily_logs_ff2024')
      .insert({
        project_id: logData.projectId,
        user_id: user.id,
        date: logData.date,
        weather: logData.weather,
        work_completed: logData.workCompleted,
        notes: logData.notes,
        crew: logData.crew || [],
        materials: logData.materials || [],
        equipment: logData.equipment || [],
        photos: logData.photos || [],
        submitted_by: logData.submittedBy,
        submitted_at: logData.submittedAt || new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    const newLog = {
      id: data.id,
      projectId: data.project_id,
      date: data.date,
      weather: data.weather,
      workCompleted: data.work_completed,
      notes: data.notes,
      crew: data.crew || [],
      materials: data.materials || [],
      equipment: data.equipment || [],
      photos: data.photos || [],
      submittedBy: data.submitted_by,
      submittedAt: data.submitted_at,
      createdAt: data.created_at
    }

    setData(prev => ({
      ...prev,
      dailyLogs: [newLog, ...prev.dailyLogs]
    }))

    return newLog
  }

  // Time entries operations
  const loadTimeEntries = async () => {
    if (!user?.id) return []

    const { data: timeEntries, error } = await supabase
      .from('time_entries_ff2024')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) throw error
    
    return timeEntries.map(entry => ({
      id: entry.id,
      projectId: entry.project_id,
      userId: entry.user_id,
      date: entry.date,
      clockIn: entry.clock_in,
      clockOut: entry.clock_out,
      breakTime: entry.break_time,
      totalHours: parseFloat(entry.total_hours),
      description: entry.description,
      location: entry.location,
      createdAt: entry.created_at
    }))
  }

  const createTimeEntry = async (entryData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('time_entries_ff2024')
      .insert({
        project_id: entryData.projectId,
        user_id: user.id,
        date: entryData.date,
        clock_in: entryData.clockIn,
        clock_out: entryData.clockOut,
        break_time: entryData.breakTime || 0,
        total_hours: entryData.totalHours,
        description: entryData.description,
        location: entryData.location
      })
      .select()
      .single()

    if (error) throw error

    const newEntry = {
      id: data.id,
      projectId: data.project_id,
      userId: data.user_id,
      date: data.date,
      clockIn: data.clock_in,
      clockOut: data.clock_out,
      breakTime: data.break_time,
      totalHours: parseFloat(data.total_hours),
      description: data.description,
      location: data.location,
      createdAt: data.created_at
    }

    setData(prev => ({
      ...prev,
      timeEntries: [newEntry, ...prev.timeEntries]
    }))

    return newEntry
  }

  // Documents operations
  const loadDocuments = async () => {
    if (!user?.id) return []

    const { data: documents, error } = await supabase
      .from('documents_ff2024')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    
    return documents.map(doc => ({
      id: doc.id,
      projectId: doc.project_id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      category: doc.category,
      url: doc.url,
      uploadedBy: doc.uploaded_by,
      uploadedAt: doc.uploaded_at
    }))
  }

  const uploadDocument = async (docData) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents_ff2024')
      .insert({
        project_id: docData.projectId,
        user_id: user.id,
        name: docData.name,
        type: docData.type,
        size: docData.size,
        category: docData.category,
        url: docData.url,
        uploaded_by: docData.uploadedBy
      })
      .select()
      .single()

    if (error) throw error

    const newDocument = {
      id: data.id,
      projectId: data.project_id,
      name: data.name,
      type: data.type,
      size: data.size,
      category: data.category,
      url: data.url,
      uploadedBy: data.uploaded_by,
      uploadedAt: data.uploaded_at
    }

    setData(prev => ({
      ...prev,
      documents: [newDocument, ...prev.documents]
    }))

    return newDocument
  }

  const deleteDocument = async (id) => {
    if (!user?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('documents_ff2024')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }))
  }

  // Getter functions
  const getProjectById = (id) => data.projects.find(p => p.id === id)
  const getTaskById = (id) => data.tasks.find(t => t.id === id)
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
    
    // Time Entries
    createTimeEntry,
    
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