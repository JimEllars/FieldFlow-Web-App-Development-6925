import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import LoadingSpinner from '../common/LoadingSpinner'

const { FiSun, FiMoon } = FiIcons

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        <SafeIcon 
          icon={theme === 'dark' ? FiSun : FiMoon} 
          className="w-5 h-5 text-gray-700 dark:text-gray-300" 
        />
      </button>

      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <img 
              src="/fieldflow-icon.svg" 
              alt="FieldFlow" 
              className="w-8 h-8" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            FieldFlow
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            by AXiM Systems
          </p>
        </div>

        {/* Auth Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          © 2024 AXiM Systems. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout