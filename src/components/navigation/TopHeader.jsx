import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useOffline } from '../../contexts/OfflineContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiMenu, FiSun, FiMoon, FiWifi, FiWifiOff, FiRotateCw } = FiIcons

const TopHeader = ({ onMenuClick }) => {
  const location = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { isOnline, syncStatus, triggerSync } = useOffline()

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

  return (
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
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getPageTitle()}
            </h1>
            {user?.company && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.company}
              </p>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Sync Status */}
          <button
            onClick={triggerSync}
            disabled={!isOnline || syncStatus === 'syncing'}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
            title={isOnline ? 'Sync data' : 'Offline'}
          >
            {syncStatus === 'syncing' ? (
              <SafeIcon 
                icon={FiRotateCw} 
                className="w-4 h-4 text-primary-600 animate-spin" 
              />
            ) : (
              <SafeIcon 
                icon={isOnline ? FiWifi : FiWifiOff} 
                className={`w-4 h-4 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} 
              />
            )}
          </button>

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
  )
}

export default TopHeader