import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const {
  FiHome, FiFolder, FiCalendar, FiCheckSquare, FiFileText, FiClock, FiUser,
  FiSettings, FiCreditCard, FiLogOut, FiX, FiSun, FiMoon, FiTestTube
} = FiIcons

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, testMode } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const mainNavItems = [
    { path: '/app/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/app/projects', icon: FiFolder, label: 'Projects' },
    { path: '/app/schedule', icon: FiCalendar, label: 'Schedule' },
    { path: '/app/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { path: '/app/daily-logs', icon: FiFileText, label: 'Daily Logs' },
    { path: '/app/time-tracking', icon: FiClock, label: 'Time Tracking' },
    { path: '/app/documents', icon: FiFileText, label: 'Documents' }
  ]

  const accountItems = [
    { path: '/app/profile', icon: FiUser, label: 'Profile' },
    { path: '/app/settings', icon: FiSettings, label: 'Settings' },
    { path: '/app/billing', icon: FiCreditCard, label: 'Billing' }
  ]

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  const handleNavigation = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <img src="/fieldflow-icon.svg" alt="FieldFlow" className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">FieldFlow</h2>
                  {testMode && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <SafeIcon icon={FiTestTube} className="w-3 h-3 mr-1" />
                      Test
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.company || 'Company'}
                  </p>
                  {user?.subscription && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      user.subscription.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {user.subscription.plan} Plan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="py-4">
              {/* Main Navigation */}
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main
                </h3>
                <nav className="space-y-1">
                  {mainNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Account Navigation */}
              <div className="px-4 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Account
                </h3>
                <nav className="space-y-1">
                  {accountItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Theme Toggle */}
              <div className="px-4 mb-6">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <SafeIcon 
                    icon={theme === 'dark' ? FiSun : FiMoon} 
                    className="w-5 h-5 mr-3" 
                  />
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Logout */}
              <div className="px-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu