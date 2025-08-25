import React from 'react'
import { motion } from 'framer-motion'
import { useOfflineStore } from '../../stores/offlineStore'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiWifi, FiWifiOff, FiRotateCw, FiCheckCircle, FiAlertCircle, FiClock } = FiIcons

const SyncStatus = ({ className = '' }) => {
  const {
    isOnline,
    syncInProgress,
    pendingChanges,
    failedChanges,
    lastSync,
    processPendingChanges,
    retryFailedChange,
    clearFailedChanges
  } = useOfflineStore()

  const syncStatus = useOfflineStore(state => state.getSyncStatus())

  const handleRetrySync = async () => {
    if (syncInProgress) return
    await processPendingChanges()
  }

  const handleRetryFailed = () => {
    failedChanges.forEach(change => {
      retryFailedChange(change.id)
    })
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: FiWifiOff,
        text: `Offline${syncStatus.pendingCount > 0 ? ` - ${syncStatus.pendingCount} changes pending` : ''}`,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700'
      }
    }

    if (syncInProgress) {
      return {
        icon: FiRotateCw,
        text: 'Syncing...',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        animate: true
      }
    }

    if (syncStatus.failedCount > 0) {
      return {
        icon: FiAlertCircle,
        text: `${syncStatus.failedCount} sync failed`,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        action: 'Retry',
        onAction: handleRetryFailed
      }
    }

    if (syncStatus.pendingCount > 0) {
      return {
        icon: FiClock,
        text: `${syncStatus.pendingCount} pending`,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        action: 'Sync Now',
        onAction: handleRetrySync
      }
    }

    if (lastSync) {
      return {
        icon: FiCheckCircle,
        text: 'Synced',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      }
    }

    return {
      icon: FiWifi,
      text: 'Online',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  }

  const config = getStatusConfig()

  if (!syncStatus.hasChanges && isOnline && !syncInProgress) {
    return null // Don't show status when everything is synced and online
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} ${className}`}
    >
      <SafeIcon 
        icon={config.icon} 
        className={`w-3 h-3 mr-1.5 ${config.animate ? 'animate-spin' : ''}`} 
      />
      <span>{config.text}</span>
      
      {config.action && (
        <button
          onClick={config.onAction}
          className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {config.action}
        </button>
      )}
    </motion.div>
  )
}

export default SyncStatus