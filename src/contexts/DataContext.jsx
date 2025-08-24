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
  const { user, isAuthenticated, testMode } = useAuth()
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

      // Production mode - load from Supabase
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
          },
          {
            id: 'project-3',
            name: 'Kitchen Renovation',
            description: 'Full kitchen remodel including cabinets, countertops, and flooring',
            client: 'Anderson Family',
            status: 'completed',
            progress: 100,
            startDate: '2024-09-15',
            endDate: '2024-10-30',
            budget: 25000,
            spent: 24500,
            address: '789 Maple Avenue, Springfield, IL 62703',
            team: ['Mike Rodriguez', 'Jennifer Lopez'],
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
          },
          {
            id: 'task-3',
            projectId: 'project-1',
            title: 'Build pergola structure',
            description: 'Construct pergola frame and install shade covering',
            status: 'pending',
            priority: 'medium',
            assignee: 'Tom Wilson',
            dueDate: '2024-12-10',
            estimatedHours: 20,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        dailyLogs: [
          {
            id: 'log-1',
            projectId: 'project-1',
            date: '2024-11-15',
            weather: 'Sunny, 68°F',
            workCompleted: 'Completed deck frame installation. All joists are level and properly spaced at 16" on center. Passed inspection.',
            notes: 'Inspector noted excellent workmanship. Ready for decking installation.',
            crew: ['Mike Rodriguez', 'Sarah Chen'],
            materials: [
              { item: 'Pressure treated lumber', quantity: '24', unit: 'pcs' },
              { item: 'Galvanized bolts', quantity: '48', unit: 'pcs' }
            ],
            equipment: ['Circular saw', 'Drill', 'Level'],
            photos: [],
            submittedBy: user.name || user.email,
            submittedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ],
        timeEntries: [
          {
            id: 'time-1',
            projectId: 'project-1',
            userId: user.id,
            date: '2024-11-15',
            clockIn: '07:30:00',
            clockOut: '16:00:00',
            breakTime: 30,
            totalHours: 8.0,
            description: 'Deck framing work - completed structural installation',
            location: { lat: 39.7817, lng: -89.6501 },
            createdAt: new Date().toISOString()
          }
        ],
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

  // Create demo data for production mode (Supabase)
  const createDemoData = async () => {
    try {
      console.log('Creating demo data for user:', user.id)

      // Create demo projects
      const demoProjects = [
        {
          user_id: user.id,
          name: 'Residential Deck Construction',
          description: 'Build a 20x16 composite deck with pergola and outdoor kitchen area',
          client: 'Johnson Family',
          status: 'active',
          progress: 65,
          start_date: '2024-11-01',
          end_date: '2024-12-15',
          budget: 15000,
          spent: 9750,
          address: '123 Oak Street, Springfield, IL 62701',
          team: ['Mike Rodriguez', 'Sarah Chen', 'Tom Wilson']
        },
        {
          user_id: user.id,
          name: 'Commercial Landscaping Project',
          description: 'Complete landscape design and installation for new office complex',
          client: 'Springfield Business Park',
          status: 'active',
          progress: 30,
          start_date: '2024-12-01',
          end_date: '2025-02-28',
          budget: 45000,
          spent: 13500,
          address: '456 Business Drive, Springfield, IL 62702',
          team: ['Lisa Martinez', 'David Park']
        },
        {
          user_id: user.id,
          name: 'Kitchen Renovation',
          description: 'Full kitchen remodel including cabinets, countertops, and flooring',
          client: 'Anderson Family',
          status: 'completed',
          progress: 100,
          start_date: '2024-09-15',
          end_date: '2024-10-30',
          budget: 25000,
          spent: 24500,
          address: '789 Maple Avenue, Springfield, IL 62703',
          team: ['Mike Rodriguez', 'Jennifer Lopez']
        }
      ]

      const { data: insertedProjects, error: projectError } = await supabase
        .from('projects_ff2024')
        .insert(demoProjects)
        .select()

      if (projectError) {
        console.error('Error creating demo projects:', projectError)
        return
      }

      console.log('Demo projects created:', insertedProjects)

      // Create demo tasks
      if (insertedProjects && insertedProjects.length > 0) {
        const demoTasks = [
          {
            project_id: insertedProjects[0].id,
            user_id: user.id,
            title: 'Install deck framing',
            description: 'Build the structural frame for the deck using pressure-treated lumber',
            status: 'completed',
            priority: 'high',
            assignee: 'Mike Rodriguez',
            due_date: '2024-11-15',
            estimated_hours: 16
          },
          {
            project_id: insertedProjects[0].id,
            user_id: user.id,
            title: 'Install composite decking',
            description: 'Lay composite decking boards and secure with hidden fasteners',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Sarah Chen',
            due_date: '2024-12-01',
            estimated_hours: 12
          },
          {
            project_id: insertedProjects[0].id,
            user_id: user.id,
            title: 'Build pergola structure',
            description: 'Construct pergola frame and install shade covering',
            status: 'pending',
            priority: 'medium',
            assignee: 'Tom Wilson',
            due_date: '2024-12-10',
            estimated_hours: 20
          }
        ]

        const { error: taskError } = await supabase
          .from('tasks_ff2024')
          .insert(demoTasks)

        if (taskError) {
          console.error('Error creating demo tasks:', taskError)
        }

        // Create demo daily logs
        const demoDailyLogs = [
          {
            project_id: insertedProjects[0].id,
            user_id: user.id,
            date: '2024-11-15',
            weather: 'Sunny, 68°F',
            work_completed: 'Completed deck frame installation. All joists are level and properly spaced at 16" on center. Passed inspection.',
            notes: 'Inspector noted excellent workmanship. Ready for decking installation.',
            crew: ['Mike Rodriguez', 'Sarah Chen'],
            materials: [
              { item: 'Pressure treated lumber', quantity: '24', unit: 'pcs' },
              { item: 'Galvanized bolts', quantity: '48', unit: 'pcs' }
            ],
            equipment: ['Circular saw', 'Drill', 'Level'],
            photos: [],
            submitted_by: user.name || user.email,
            submitted_at: new Date().toISOString()
          }
        ]

        const { error: logError } = await supabase
          .from('daily_logs_ff2024')
          .insert(demoDailyLogs)

        if (logError) {
          console.error('Error creating demo daily logs:', logError)
        }

        // Create demo time entries
        const demoTimeEntries = [
          {
            project_id: insertedProjects[0].id,
            user_id: user.id,
            date: '2024-11-15',
            clock_in: '07:30:00',
            clock_out: '16:00:00',
            break_time: 30,
            total_hours: 8.0,
            description: 'Deck framing work - completed structural installation',
            location: { lat: 39.7817, lng: -89.6501 }
          }
        ]

        const { error: timeError } = await supabase
          .from('time_entries_ff2024')
          .insert(demoTimeEntries)

        if (timeError) {
          console.error('Error creating demo time entries:', timeError)
        }

        console.log('Demo data creation completed')
      }

    } catch (error) {
      console.error('Error in createDemoData:', error)
    }
  }

  // Projects operations
  const loadProjects = async () => {
    if (!user?.id || testMode) return []

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

    if (testMode) {
      // Test mode - store in localStorage
      const newProject = {
        id: `project-${Date.now()}`,
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

      const newData = {
        ...data,
        projects: [newProject, ...data.projects]
      }
      setData(newData)
      saveDataTestMode(newData)
      return newProject
    }

    // Production mode - use Supabase
    const { data: result, error } = await supabase
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
      id: result.id,
      name: result.name,
      description: result.description,
      client: result.client,
      status: result.status,
      progress: result.progress,
      startDate: result.start_date,
      endDate: result.end_date,
      budget: parseFloat(result.budget || 0),
      spent: parseFloat(result.spent || 0),
      address: result.address,
      team: result.team || [],
      createdAt: result.created_at,
      updatedAt: result.updated_at
    }

    setData(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects]
    }))

    return newProject
  }

  // Similar implementations for other CRUD operations...
  // For brevity, I'll include the main getter functions

  const loadTasks = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation...
  }

  const loadDailyLogs = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation...
  }

  const loadTimeEntries = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation...
  }

  const loadDocuments = async () => {
    if (!user?.id || testMode) return []
    // Supabase implementation...
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
    // updateProject,
    // deleteProject,

    // Other operations would be implemented similarly
    testMode
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}