import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiHome, FiFolder, FiCalendar, FiCheckSquare, FiClock, FiUsers } = FiIcons

const BottomNavigation = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  // Base navigation items for all users
  const baseNavItems = [
    { path: '/app/dashboard', icon: FiHome, label: 'Home', exact: true },
    { path: '/app/projects', icon: FiFolder, label: 'Projects' },
    { path: '/app/schedule', icon: FiCalendar, label: 'Schedule' },
    { path: '/app/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { path: '/app/time-tracking', icon: FiClock, label: 'Time' }
  ]

  // Add team management for admins
  const adminNavItems = [
    ...baseNavItems.slice(0, 4), // First 4 items
    { path: '/app/team', icon: FiUsers, label: 'Team' } // Replace time tracking with team for admins
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : baseNavItems

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 min-w-[60px] tap-target ${
              isActive(item.path, item.exact)
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <SafeIcon icon={item.icon} className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation