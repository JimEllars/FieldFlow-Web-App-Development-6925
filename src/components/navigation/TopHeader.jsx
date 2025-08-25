import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import SyncStatus from '../common/SyncStatus'
import SyncStatusModal from '../common/SyncStatusModal'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiMenu, FiSun, FiMoon, FiTestTube } = FiIcons

const TopHeader = ({ onMenuClick }) => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { theme, setTheme } = useAppStore()
  const [showSyncModal, setShowSyncModal] = useState(false)

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/projects')) return 'Projects'
    if (path.includes('/schedule')) return 'Schedule'
    if (path.includes('/tasks')) return 'Tasks'
    if (path.includes('/daily-logs')) return 'Daily Logs'
    if (path.includes('/time-tracking')) return 'Time Tracking'
    if (path.includes('/documents')) return 'Documents'
    if (path.includes('/profile')) return 'Profile'
    if (path.includes('/settings')) return 'Settings'
    if (path.includes('/billing')) return 'Billing'
    return 'FieldFlow'
  }

  const handleSyncStatusClick = () => {
    setShowSyncModal(true)
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 md:hidden"
            >
              <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getPageTitle()}
                </h1>
                {user?.subscription?.status === 'trial' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <SafeIcon icon={FiTestTube} className="w-3 h-3 mr-1" />
                    Trial
                  </span>
                )}
              </div>
              {user?.company && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.company}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Sync Status - Clickable */}
            <div onClick={handleSyncStatusClick} className="cursor-pointer">
              <SyncStatus showDetails={true} />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              <SafeIcon 
                icon={theme === 'dark' ? FiSun : FiMoon} 
                className="w-4 h-4 text-gray-700 dark:text-gray-300" 
              />
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sync Status Modal */}
      <SyncStatusModal 
        isOpen={showSyncModal} 
        onClose={() => setShowSyncModal(false)} 
      />
    </>
  )
}

export default TopHeader