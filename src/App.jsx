import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from './store'

const { FiHome, FiFolder, FiCheckSquare, FiCalendar, FiFileText, FiClock, FiUser, FiSettings, FiMenu, FiX, FiPlus, FiSearch, FiSun, FiMoon, FiChevronRight, FiMapPin, FiDollarSign } = FiIcons

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
          <Route path="tasks" element={<TasksScreen />} />
          <Route path="schedule" element={<ScheduleScreen />} />
          <Route path="daily-logs" element={<DailyLogsScreen />} />
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
    { title: 'New Project', icon: FiFolder, color: 'bg-blue-500' },
    { title: 'Add Task', icon: FiCheckSquare, color: 'bg-green-500' },
    { title: 'Daily Log', icon: FiFileText, color: 'bg-orange-500' },
    { title: 'Time Track', icon: FiClock, color: 'bg-purple-500' }
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
            <button
              key={index}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
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
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
              <div key={task.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
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
              </div>
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
          <button className="btn-primary py-2 px-4 flex items-center">
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Add Project</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try changing your search' : 'Start by creating your first project'}
            </p>
            <button className="btn-primary inline-flex items-center">
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Add Project
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow duration-200">
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Other screen components (simplified for brevity)
const ProjectDetailScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Project Details</h1><p className="text-gray-600 mt-2">Project detail view coming soon...</p></div></div>
const TasksScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Tasks</h1><p className="text-gray-600 mt-2">Tasks management coming soon...</p></div></div>
const ScheduleScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Schedule</h1><p className="text-gray-600 mt-2">Project schedule coming soon...</p></div></div>
const DailyLogsScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Daily Logs</h1><p className="text-gray-600 mt-2">Daily logs coming soon...</p></div></div>
const TimeTrackingScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Time Tracking</h1><p className="text-gray-600 mt-2">Time tracking coming soon...</p></div></div>
const ProfileScreen = () => <div className="p-4"><div className="card"><h1 className="text-xl font-bold">Profile</h1><p className="text-gray-600 mt-2">User profile coming soon...</p></div></div>

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