import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from './store'

const { FiHome, FiFolder, FiCheckSquare, FiCalendar, FiFileText, FiClock, FiUser, FiSettings, FiMenu, FiX, FiPlus, FiSearch, FiSun, FiMoon, FiChevronRight, FiMapPin, FiDollarSign, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiPlay, FiPause, FiCamera, FiUpload, FiDownload } = FiIcons

// Safe Icon Component
const SafeIcon = ({ icon: IconComponent, ...props }) => {
  return IconComponent ? <IconComponent {...props} /> : <FiIcons.FiAlertTriangle {...props} />
}

// Loading Spinner
const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <motion.div 
      className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{text}</p>
  </div>
)

// Auth Layout
const AuthLayout = () => {
  const { theme, setTheme } = useStore()
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <SafeIcon icon={theme === 'dark' ? FiSun : FiMoon} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <SafeIcon icon={FiFolder} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FieldFlow</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">by AXiM Systems</p>
        </div>
        
        <LoginScreen />
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          © 2024 AXiM Systems. All rights reserved.
        </p>
      </div>
    </div>
  )
}

// Login Screen
const LoginScreen = () => {
  const { login } = useStore()
  const [email, setEmail] = useState('demo@fieldflow.com')
  const [password, setPassword] = useState('demo123456')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate login
    setTimeout(() => {
      login({ 
        id: 'demo-user',
        email: email,
        name: 'John Contractor',
        company: 'Demo Construction Co.'
      })
      setLoading(false)
    }, 1000)
  }

  const handleDemoLogin = () => {
    setEmail('demo@fieldflow.com')
    setPassword('demo123456')
    handleSubmit({ preventDefault: () => {} })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Sign in to your FieldFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center"
          >
            {loading ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-t-transparent border-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">🚀 Try the Demo</p>
            <div className="text-xs text-blue-600 dark:text-blue-300 mb-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
              <strong>Demo Credentials:</strong><br />
              Email: demo@fieldflow.com<br />
              Password: demo123456
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Demo Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

// App Layout
const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <TopHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1 pb-16 overflow-hidden">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="projects" element={<ProjectsScreen />} />
          <Route path="projects/:id" element={<ProjectDetailScreen />} />
          <Route path="projects/new" element={<CreateProjectScreen />} />
          <Route path="projects/:id/edit" element={<EditProjectScreen />} />
          <Route path="tasks" element={<TasksScreen />} />
          <Route path="tasks/:id" element={<TaskDetailScreen />} />
          <Route path="tasks/new" element={<CreateTaskScreen />} />
          <Route path="schedule" element={<ScheduleScreen />} />
          <Route path="daily-logs" element={<DailyLogsScreen />} />
          <Route path="daily-logs/new" element={<CreateDailyLogScreen />} />
          <Route path="time-tracking" element={<TimeTrackingScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Routes>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

// Top Header
const TopHeader = ({ onMenuClick }) => {
  const { user, theme, setTheme } = useStore()
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 md:hidden"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">FieldFlow</h1>
            {user?.company && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.company}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <SafeIcon icon={theme === 'dark' ? FiSun : FiMoon} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

// Mobile Menu
const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useStore()

  const navItems = [
    { path: '/app/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/app/projects', icon: FiFolder, label: 'Projects' },
    { path: '/app/schedule', icon: FiCalendar, label: 'Schedule' },
    { path: '/app/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { path: '/app/daily-logs', icon: FiFileText, label: 'Daily Logs' },
    { path: '/app/time-tracking', icon: FiClock, label: 'Time Tracking' },
    { path: '/app/profile', icon: FiUser, label: 'Profile' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiFolder} className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">FieldFlow</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <SafeIcon icon={FiX} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.company || 'Company'}</p>
                </div>
              </div>
            </div>

            <div className="py-4">
              <nav className="space-y-1 px-4">
                {navItems.map((item) => (
                  <a
                    key={item.path}
                    href={`#${item.path}`}
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="px-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSettings} className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Bottom Navigation
const BottomNavigation = () => {
  const navItems = [
    { path: '/app/dashboard', icon: FiHome, label: 'Home' },
    { path: '/app/projects', icon: FiFolder, label: 'Projects' },
    { path: '/app/schedule', icon: FiCalendar, label: 'Schedule' },
    { path: '/app/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { path: '/app/time-tracking', icon: FiClock, label: 'Time' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={`#${item.path}`}
            className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 min-w-[60px] text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <SafeIcon icon={item.icon} className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

// Dashboard Screen
const DashboardScreen = () => {
  const { user, projects, tasks } = useStore()

  const stats = {
    activeProjects: projects.filter(p => p.status === 'active').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    totalProjects: projects.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length
  }

  const quickActions = [
    { title: 'New Project', icon: FiFolder, color: 'bg-blue-500', path: '#/app/projects/new' },
    { title: 'Add Task', icon: FiCheckSquare, color: 'bg-green-500', path: '#/app/tasks/new' },
    { title: 'Daily Log', icon: FiFileText, color: 'bg-orange-500', path: '#/app/daily-logs/new' },
    { title: 'Time Track', icon: FiClock, color: 'bg-purple-500', path: '#/app/time-tracking' }
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-primary-100">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiFolder} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingTasks}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiFolder} className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                {action.title}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <a
                key={project.id}
                href={`#/app/projects/${project.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.client}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{project.progress}% complete</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
              <a
                key={task.id}
                href={`#/app/tasks/${task.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to: {task.assignee}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : task.priority === 'medium' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Projects Screen
const ProjectsScreen = () => {
  const { projects } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <a href="#/app/projects/new" className="btn-primary py-2 px-4 flex items-center">
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Add Project</span>
          </a>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try changing your search' : 'Start by creating your first project'}
            </p>
            <a href="#/app/projects/new" className="btn-primary inline-flex items-center">
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Add Project
            </a>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <a
              key={project.id}
              href={`#/app/projects/${project.id}`}
              className="card block hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{project.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : project.status === 'planning'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.client}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                      <span>{format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1" />
                      <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{project.progress}% complete</p>
                  </div>
                </div>
                <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

// Create Project Screen
const CreateProjectScreen = () => {
  const { createProject } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
    address: '',
    team: []
  })
  const [teamMember, setTeamMember] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      createProject({
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        spent: 0,
        progress: 0
      })
      setLoading(false)
      window.location.hash = '#/app/projects'
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addTeamMember = () => {
    if (teamMember.trim()) {
      setFormData({
        ...formData,
        team: [...formData.team, teamMember.trim()]
      })
      setTeamMember('')
    }
  }

  const removeTeamMember = (index) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <a href="#/app/projects" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </a>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client *
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter client name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Describe the project scope and details"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Team Members</h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              className="input-field"
              placeholder="Enter team member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
            />
            <button type="button" onClick={addTeamMember} className="btn-secondary py-2 px-3">
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.team.length > 0 ? (
            <div className="space-y-2">
              {formData.team.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No team members added yet</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Project Detail Screen
const ProjectDetailScreen = () => {
  const { projects, tasks } = useStore()
  const projectId = window.location.hash.split('/').pop()
  const project = projects.find(p => p.id === projectId)
  const projectTasks = tasks.filter(t => t.projectId === projectId)

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Project not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
          <a href="#/app/projects" className="btn-primary">Back to Projects</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <a href="#/app/projects" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </a>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <a href={`#/app/projects/${projectId}/edit`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <SafeIcon icon={FiEdit2} className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{project.client}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : project.status === 'planning'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1 text-gray-500" />
              {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-1 text-gray-500" />
              ${project.budget.toLocaleString()}
            </div>
          </div>
          {project.address && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
              <div className="flex items-center text-gray-900 dark:text-gray-100">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-1 text-gray-500" />
                {project.address}
              </div>
            </div>
          )}
          {project.team.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Team</p>
              <p className="text-gray-900 dark:text-gray-100">{project.team.join(', ')}</p>
            </div>
          )}
        </div>
        {project.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-gray-900 dark:text-gray-100">{project.description}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tasks</h3>
          <a href={`#/app/tasks/new?projectId=${projectId}`} className="btn-primary py-1.5 px-3 text-sm">
            <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
            Add Task
          </a>
        </div>
        
        {projectTasks.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiCheckSquare} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No tasks yet</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add tasks to track work on this project</p>
            <a href={`#/app/tasks/new?projectId=${projectId}`} className="btn-primary py-1.5 px-3 text-sm">
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1 inline" />
              Add First Task
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {projectTasks.map((task) => (
              <a
                key={task.id}
                href={`#/app/tasks/${task.id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <div className="flex items-center mt-2 text-sm">
                      <div className="mr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="mr-4 text-gray-600 dark:text-gray-400">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3 inline mr-1" />
                        Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Assigned to: {task.assignee}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Tasks Screen
const TasksScreen = () => {
  const { tasks, projects } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredTasks = tasks
    .filter(task => {
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filter !== 'all' && task.status !== filter) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field py-2 pl-3 pr-8"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <a href="#/app/tasks/new" className="btn-primary py-2 px-4 flex items-center">
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Add Task</span>
            </a>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <SafeIcon icon={FiCheckSquare} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filter !== 'all' ? 'Try changing your search or filter' : 'Start by creating your first task'}
            </p>
            <a href="#/app/tasks/new" className="btn-primary inline-flex items-center">
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Add Task
            </a>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <a
              key={task.id}
              href={`#/app/tasks/${task.id}`}
              className="card block hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Assigned to: {task.assignee}
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.estimatedHours} hours estimated
                    </div>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {task.priority}
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Project: </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

// Create Task Screen
const CreateTaskScreen = () => {
  const { createTask, projects } = useStore()
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
  const projectIdParam = urlParams.get('projectId')
  
  const [formData, setFormData] = useState({
    projectId: projectIdParam || '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    estimatedHours: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      createTask({
        ...formData,
        estimatedHours: parseFloat(formData.estimatedHours) || 0
      })
      setLoading(false)
      window.location.hash = '#/app/tasks'
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <a href="#/app/tasks" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </a>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select name="projectId" value={formData.projectId} onChange={handleChange} className="input-field" required>
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned To *
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter assignee name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[120px]"
                placeholder="Describe the task details and requirements"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Create Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Task Detail Screen
const TaskDetailScreen = () => {
  const { tasks, projects, updateTask } = useStore()
  const taskId = window.location.hash.split('/').pop()
  const task = tasks.find(t => t.id === taskId)
  const project = task ? projects.find(p => p.id === task.projectId) : null

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Task not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The task you're looking for doesn't exist.</p>
          <a href="#/app/tasks" className="btn-primary">Back to Tasks</a>
        </div>
      </div>
    )
  }

  const handleStatusChange = (newStatus) => {
    updateTask(taskId, { status: newStatus })
  }

  const getStatusActionButton = () => {
    switch (task.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleStatusChange('in-progress')}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiCheckSquare} className="w-4 h-4 mr-2" />
            Start Task
          </button>
        )
      case 'in-progress':
        return (
          <button
            onClick={() => handleStatusChange('completed')}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiCheckSquare} className="w-4 h-4 mr-2" />
            Complete Task
          </button>
        )
      case 'completed':
        return (
          <button
            onClick={() => handleStatusChange('pending')}
            className="btn-secondary py-2 px-4 flex items-center"
          >
            <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
            Reopen Task
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <a href="#/app/tasks" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </a>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{task.title}</h1>
            {project && (
              <a href={`#/app/projects/${project.id}`} className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
                {project.name}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          task.status === 'completed' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : task.status === 'in-progress'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          task.priority === 'high' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : task.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{task.assignee}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estimated hours</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{task.estimatedHours} hours</p>
            </div>
          </div>
        </div>

        {task.description && (
          <div className="mt-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{task.description}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {getStatusActionButton()}
      </div>
    </div>
  )
}

// Schedule Screen
const ScheduleScreen = () => {
  const { tasks, projects } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get upcoming tasks sorted by due date
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10)

  const getTasksForToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => task.dueDate === today)
  }

  const getTasksForWeek = () => {
    const today = new Date()
    const weekFromNow = new Date(today)
    weekFromNow.setDate(today.getDate() + 7)
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate >= today && taskDate <= weekFromNow && task.status !== 'completed'
    })
  }

  const todayTasks = getTasksForToday()
  const weekTasks = getTasksForWeek()

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Schedule</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Tasks</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{todayTasks.length} tasks</span>
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiCalendar} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No tasks due today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId)
              return (
                <a
                  key={task.id}
                  href={`#/app/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {project?.name || 'Unknown Project'} • {task.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                    {task.estimatedHours}h
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* This Week */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">This Week</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{weekTasks.length} tasks</span>
        </div>
        
        {weekTasks.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiCalendar} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No tasks scheduled for this week</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weekTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId)
              return (
                <a
                  key={task.id}
                  href={`#/app/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {project?.name || 'Unknown Project'} • Assigned to {task.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Tasks</h2>
          <a href="#/app/tasks" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
            View All
          </a>
        </div>
        
        <div className="space-y-3">
          {upcomingTasks.map(task => {
            const project = projects.find(p => p.id === task.projectId)
            return (
              <a
                key={task.id}
                href={`#/app/tasks/${task.id}`}
                className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {project?.name || 'Unknown Project'} • Assigned to {task.assignee}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Daily Logs Screen
const DailyLogsScreen = () => {
  const { dailyLogs, projects } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = dailyLogs
    .filter(log => {
      if (searchTerm && !log.workCompleted.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search daily logs..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <a href="#/app/daily-logs/new" className="btn-primary py-2 px-4 flex items-center">
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Add Log</span>
          </a>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="card text-center py-12">
            <SafeIcon icon={FiFileText} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No daily logs found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try changing your search' : 'Start by creating your first daily log'}
            </p>
            <a href="#/app/daily-logs/new" className="btn-primary inline-flex items-center">
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Add Daily Log
            </a>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center">
                    <SafeIcon icon={FiCalendar} className="w-5 h-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {log.weather} • Project: {projects.find(p => p.id === log.projectId)?.name || 'Unknown Project'}
                  </p>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{log.submittedBy}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Work Completed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{log.workCompleted}</p>
              </div>
              
              {log.materials && log.materials.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Materials</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {log.materials.map((material, index) => (
                      <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs mr-2 mb-2">
                        {material.item}: {material.quantity} {material.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <a
                  href={`#/app/projects/${log.projectId}`}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View Project
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Create Daily Log Screen
const CreateDailyLogScreen = () => {
  const { createDailyLog, projects, user } = useStore()
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
  const projectIdParam = urlParams.get('projectId')
  
  const [formData, setFormData] = useState({
    projectId: projectIdParam || '',
    date: new Date().toISOString().split('T')[0],
    weather: 'Sunny, 75°F',
    workCompleted: '',
    notes: '',
    crew: [],
    materials: [],
    equipment: []
  })
  const [crewMember, setCrewMember] = useState('')
  const [material, setMaterial] = useState({ item: '', quantity: '', unit: '' })
  const [equipment, setEquipment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      createDailyLog({
        ...formData,
        submittedBy: user?.name || user?.email || 'Unknown User',
        submittedAt: new Date().toISOString()
      })
      setLoading(false)
      window.location.hash = '#/app/daily-logs'
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addCrewMember = () => {
    if (crewMember.trim()) {
      setFormData({
        ...formData,
        crew: [...formData.crew, crewMember.trim()]
      })
      setCrewMember('')
    }
  }

  const removeCrewMember = (index) => {
    setFormData({
      ...formData,
      crew: formData.crew.filter((_, i) => i !== index)
    })
  }

  const addMaterial = () => {
    if (material.item.trim() && material.quantity && material.unit.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, { ...material }]
      })
      setMaterial({ item: '', quantity: '', unit: '' })
    }
  }

  const removeMaterial = (index) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    })
  }

  const addEquipment = () => {
    if (equipment.trim()) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, equipment.trim()]
      })
      setEquipment('')
    }
  }

  const removeEquipment = (index) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <a href="#/app/daily-logs" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </a>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Daily Log</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select name="projectId" value={formData.projectId} onChange={handleChange} className="input-field" required>
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weather Conditions
              </label>
              <input
                type="text"
                name="weather"
                value={formData.weather}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Sunny, 75°F"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Completed Today *
            </label>
            <textarea
              name="workCompleted"
              value={formData.workCompleted}
              onChange={handleChange}
              className="input-field min-h-[100px]"
              placeholder="Describe the work completed today"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field min-h-[80px]"
              placeholder="Any additional notes, issues, or observations"
            />
          </div>
        </div>

        {/* Crew Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Crew Members</h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={crewMember}
              onChange={(e) => setCrewMember(e.target.value)}
              className="input-field"
              placeholder="Enter crew member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrewMember())}
            />
            <button type="button" onClick={addCrewMember} className="btn-secondary py-2 px-3">
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.crew.length > 0 ? (
            <div className="space-y-2">
              {formData.crew.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => removeCrewMember(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No crew members added yet</p>
          )}
        </div>

        {/* Materials Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Materials Used</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <input
              type="text"
              value={material.item}
              onChange={(e) => setMaterial({ ...material, item: e.target.value })}
              className="input-field col-span-3 sm:col-span-1"
              placeholder="Material name"
            />
            <input
              type="number"
              value={material.quantity}
              onChange={(e) => setMaterial({ ...material, quantity: e.target.value })}
              className="input-field"
              placeholder="Quantity"
              min="0"
              step="0.01"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={material.unit}
                onChange={(e) => setMaterial({ ...material, unit: e.target.value })}
                className="input-field"
                placeholder="Unit (e.g., ft, pcs)"
              />
              <button type="button" onClick={addMaterial} className="btn-secondary py-2 px-3">
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {formData.materials.length > 0 ? (
            <div className="space-y-2">
              {formData.materials.map((mat, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-100">
                    {mat.item}: {mat.quantity} {mat.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No materials added yet</p>
          )}
        </div>

        {/* Equipment Section */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Equipment Used</h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="input-field"
              placeholder="Enter equipment name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
            />
            <button type="button" onClick={addEquipment} className="btn-secondary py-2 px-3">
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.equipment.length > 0 ? (
            <div className="space-y-2">
              {formData.equipment.map((equip, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-100">{equip}</span>
                  <button
                    type="button"
                    onClick={() => removeEquipment(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No equipment added yet</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Save Daily Log
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Time Tracking Screen
const TimeTrackingScreen = () => {
  const { timeEntries, projects, createTimeEntry } = useStore()
  const [isTracking, setIsTracking] = useState(false)
  const [activeProject, setActiveProject] = useState('')
  const [trackingStartTime, setTrackingStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [description, setDescription] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualEntry, setManualEntry] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
    description: ''
  })

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Update elapsed time every second when tracking
  useEffect(() => {
    let interval
    if (isTracking && trackingStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now - trackingStartTime) / 1000)
        setElapsedTime(diff)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, trackingStartTime])

  const startTracking = () => {
    if (!activeProject) {
      alert('Please select a project before starting time tracking')
      return
    }
    
    setTrackingStartTime(new Date())
    setIsTracking(true)
    setElapsedTime(0)
  }

  const stopTracking = () => {
    const startTime = trackingStartTime
    const endTime = new Date()
    const totalSeconds = Math.floor((endTime - startTime) / 1000)
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(2))

    const timeEntry = {
      projectId: activeProject,
      date: startTime.toISOString().split('T')[0],
      clockIn: startTime.toTimeString().split(' ')[0],
      clockOut: endTime.toTimeString().split(' ')[0],
      totalHours,
      description
    }

    createTimeEntry(timeEntry)
    
    // Reset tracking state
    setIsTracking(false)
    setTrackingStartTime(null)
    setElapsedTime(0)
    setDescription('')
  }

  const handleManualEntryChange = (e) => {
    setManualEntry({
      ...manualEntry,
      [e.target.name]: e.target.value
    })
  }

  const calculateTotalHours = () => {
    if (!manualEntry.clockIn || !manualEntry.clockOut) return 0
    
    const [inHours, inMinutes] = manualEntry.clockIn.split(':').map(Number)
    const [outHours, outMinutes] = manualEntry.clockOut.split(':').map(Number)
    
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes)
    return parseFloat((totalMinutes / 60).toFixed(2))
  }

  const submitManualEntry = (e) => {
    e.preventDefault()
    
    if (!manualEntry.projectId || !manualEntry.clockIn || !manualEntry.clockOut) {
      alert('Please fill in all required fields')
      return
    }

    const totalHours = calculateTotalHours()
    if (totalHours <= 0) {
      alert('Clock out time must be after clock in time')
      return
    }

    createTimeEntry({
      ...manualEntry,
      totalHours
    })

    // Reset form
    setManualEntry({
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      clockIn: '',
      clockOut: '',
      description: ''
    })
    setShowManualEntry(false)
  }

  const recentTimeEntries = [...timeEntries]
    .sort((a, b) => new Date(b.date + 'T' + b.clockIn) - new Date(a.date + 'T' + a.clockIn))
    .slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Time Tracking</h1>
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="btn-secondary py-2 px-3 text-sm flex items-center"
        >
          <SafeIcon icon={showManualEntry ? FiClock : FiPlus} className="w-4 h-4 mr-1" />
          {showManualEntry ? 'Live Tracking' : 'Manual Entry'}
        </button>
      </div>

      {showManualEntry ? (
        /* Manual Time Entry Form */
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add Manual Time Entry</h2>
          
          <form onSubmit={submitManualEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project *
                </label>
                <select
                  name="projectId"
                  value={manualEntry.projectId}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  name="date"
                  type="date"
                  value={manualEntry.date}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clock In *
                </label>
                <input
                  name="clockIn"
                  type="time"
                  value={manualEntry.clockIn}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clock Out *
                </label>
                <input
                  name="clockOut"
                  type="time"
                  value={manualEntry.clockOut}
                  onChange={handleManualEntryChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Hours
                </label>
                <div className="input-field bg-gray-50 dark:bg-gray-800 flex items-center">
                  <span>{calculateTotalHours()}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={manualEntry.description}
                onChange={handleManualEntryChange}
                className="input-field min-h-[80px]"
                placeholder="Describe the work performed"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary py-2 px-6 flex items-center">
                <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                Save Entry
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Live Time Tracking */
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Live Time Tracking</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isTracking ? 'Time tracking in progress' : 'Ready to start tracking'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project *
              </label>
              <select
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="input-field"
                disabled={isTracking}
                required
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Describe the work you're performing"
                disabled={!isTracking}
              />
            </div>

            <div className="flex justify-center">
              {isTracking ? (
                <button
                  onClick={stopTracking}
                  className="btn-primary bg-red-600 hover:bg-red-700 py-3 px-8 flex items-center"
                >
                  <SafeIcon icon={FiPause} className="w-5 h-5 mr-2" />
                  Stop & Save
                </button>
              ) : (
                <button
                  onClick={startTracking}
                  disabled={!activeProject}
                  className="btn-primary py-3 px-8 flex items-center"
                >
                  <SafeIcon icon={FiPlay} className="w-5 h-5 mr-2" />
                  Start Tracking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Time Entries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Time Entries</h2>
        </div>
        
        {recentTimeEntries.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No time entries recorded yet</p>
        ) : (
          <div className="space-y-3">
            {recentTimeEntries.map((entry) => {
              const project = projects.find(p => p.id === entry.projectId)
              return (
                <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 text-primary-600 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {entry.totalHours} hours
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                          {format(new Date(entry.date), 'MMM d, yyyy')} • {entry.clockIn.substring(0, 5)} - {entry.clockOut.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {project ? project.name : 'Unknown Project'}
                      </span>
                    </div>
                  </div>
                  {entry.description && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {entry.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Profile Screen
const ProfileScreen = () => {
  const { user, updateUser } = useStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      updateUser(formData)
      setSuccess('Profile updated successfully')
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2 border border-gray-200 dark:border-gray-600">
                <SafeIcon icon={FiCamera} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.company}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Professional Plan
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your.email@example.com"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="input-field"
                placeholder="Your company name"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2 px-6 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Security */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Security</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Change your password to keep your account secure.
            </p>
            <button type="button" className="btn-secondary py-2 px-4 text-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive updates about projects, tasks, and daily logs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive real-time alerts on your mobile device
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Project Screen
const EditProjectScreen = () => {
  const { projects, updateProject } = useStore()
  const projectId = window.location.hash.split('/')[3] // Extract from /projects/:id/edit
  const project = projects.find(p => p.id === projectId)
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    client: project?.client || '',
    status: project?.status || 'planning',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    budget: project?.budget || '',
    address: project?.address || '',
    team: project?.team || []
  })
  const [teamMember, setTeamMember] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      updateProject(projectId, {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      })
      setLoading(false)
      window.location.hash = `#/app/projects/${projectId}`
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addTeamMember = () => {
    if (teamMember.trim()) {
      setFormData({
        ...formData,
        team: [...formData.team, teamMember.trim()]
      })
      setTeamMember('')
    }
  }

  const removeTeamMember = (index) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index)
    })
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Project not found</h2>
          <a href="#/app/projects" className="btn-primary">Back to Projects</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <a href={`#/app/projects/${projectId}`} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </a>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client *
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter client name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter project address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                placeholder="Describe the project scope and details"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Team Members</h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              className="input-field"
              placeholder="Enter team member name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
            />
            <button type="button" onClick={addTeamMember} className="btn-secondary py-2 px-3">
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
            </button>
          </div>

          {formData.team.length > 0 ? (
            <div className="space-y-2">
              {formData.team.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-gray-100">{member}</span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No team members added yet</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
                Update Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

// Main App Component
function App() {
  const { theme, setTheme, isAuthenticated } = useStore()

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('fieldflow-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthLayout />} />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App