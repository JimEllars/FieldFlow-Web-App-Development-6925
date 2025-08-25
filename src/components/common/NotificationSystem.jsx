import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../stores/appStore'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertCircle } = FiIcons

const NotificationSystem = () => {
  const { notifications, removeNotification } = useAppStore()

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return FiCheckCircle
      case 'warning': return FiAlertTriangle
      case 'error': return FiAlertCircle
      default: return FiInfo
    }
  }

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            getIcon={getNotificationIcon}
            getColors={getNotificationColors}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

const NotificationItem = ({ notification, onRemove, getIcon, getColors }) => {
  // Auto-remove notification after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={`p-4 rounded-lg border shadow-lg ${getColors(notification.type)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <SafeIcon icon={getIcon(notification.type)} className="w-5 h-5" />
        </div>
        
        <div className="ml-3 flex-1">
          {notification.title && (
            <p className="text-sm font-medium">
              {notification.title}
            </p>
          )}
          <p className={`text-sm ${notification.title ? 'mt-1' : ''}`}>
            {notification.message}
          </p>
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(notification.id)}
            className="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default NotificationSystem