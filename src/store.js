import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Sample data with more comprehensive examples
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
    team: ['Mike Rodriguez', 'Sarah Chen', 'Tom Wilson']
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
    team: ['Lisa Martinez', 'David Park']
  },
  {
    id: '3',
    name: 'Kitchen Renovation',
    description: 'Complete kitchen remodel with custom cabinets and granite countertops',
    client: 'Smith Residence',
    status: 'planning',
    progress: 10,
    startDate: '2025-01-15',
    endDate: '2025-03-30',
    budget: 35000,
    spent: 3500,
    address: '789 Maple Ave, Springfield, IL 62703',
    team: ['John Davis', 'Emma Wilson']
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
    estimatedHours: 16
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
    estimatedHours: 12
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
    estimatedHours: 8
  },
  {
    id: '4',
    projectId: '3',
    title: 'Design review',
    description: 'Review kitchen design plans with client and finalize details',
    status: 'pending',
    priority: 'high',
    assignee: 'John Davis',
    dueDate: '2025-01-05',
    estimatedHours: 4
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

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      
      // UI state
      theme: 'light',
      
      // Data with expanded sample data
      projects: sampleProjects,
      tasks: sampleTasks,
      dailyLogs: sampleDailyLogs,
      timeEntries: sampleTimeEntries,
      documents: [],
      
      // Actions
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      setTheme: (theme) => {
        set({ theme })
        localStorage.setItem('foremanos-theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      
      // Project actions
      createProject: (projectData) => set((state) => ({
        projects: [...state.projects, { 
          id: Date.now().toString(), 
          ...projectData,
          progress: 0,
          spent: 0
        }]
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      
      // Task actions
      createTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, { 
          id: Date.now().toString(), 
          ...taskData 
        }]
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      
      // Daily log actions
      createDailyLog: (logData) => set((state) => ({
        dailyLogs: [...state.dailyLogs, {
          id: Date.now().toString(),
          ...logData
        }]
      })),
      
      updateDailyLog: (id, updates) => set((state) => ({
        dailyLogs: state.dailyLogs.map(log =>
          log.id === id ? { ...log, ...updates } : log
        )
      })),
      
      deleteDailyLog: (id) => set((state) => ({
        dailyLogs: state.dailyLogs.filter(log => log.id !== id)
      })),
      
      // Time entry actions
      createTimeEntry: (entryData) => set((state) => ({
        timeEntries: [...state.timeEntries, {
          id: Date.now().toString(),
          ...entryData
        }]
      })),
      
      updateTimeEntry: (id, updates) => set((state) => ({
        timeEntries: state.timeEntries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      })),
      
      deleteTimeEntry: (id) => set((state) => ({
        timeEntries: state.timeEntries.filter(entry => entry.id !== id)
      })),
      
      // Document actions
      createDocument: (docData) => set((state) => ({
        documents: [...state.documents, {
          id: Date.now().toString(),
          ...docData,
          uploadedAt: new Date().toISOString()
        }]
      })),
      
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id)
      }))
    }),
    {
      name: 'foremanos-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        projects: state.projects,
        tasks: state.tasks,
        dailyLogs: state.dailyLogs,
        timeEntries: state.timeEntries,
        documents: state.documents
      })
    }
  )
)