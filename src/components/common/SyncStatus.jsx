import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStore } from '../../stores/offlineStore'
import SyncStatusModal from './SyncStatusModal'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiWifi, FiWifiOff, FiRotateCw, FiCheckCircle, FiAlertCircle, FiClock, FiAlertTriangle } = FiIcons

const SyncStatus = ({ className = '', showDetails = false }) => {
  const [showModal, setShowModal] = useState(false)
  const {
    isOnline,
    syncInProgress,
    pendingChanges,
    failedChanges,
    lastSync,
    getSyncStatus,
    processPendingChanges
  } = useOfflineStore()

  const syncStatus = getSyncStatus()

  const handleRetrySync = async () => {
    if (syncInProgress) return
    await processPendingChanges()
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: FiWifiOff,
        text: `Offline${syncStatus.pendingCount > 0 ? ` - ${syncStatus.pendingCount} changes pending` : ''}`,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        priority: 'low',
        clickable: syncStatus.pendingCount > 0
      }
    }

    if (syncInProgress) {
      return {
        icon: FiRotateCw,
        text: `Syncing ${syncStatus.pendingCount} changes...`,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        animate: true,
        priority: 'medium',
        clickable: true
      }
    }

    if (syncStatus.failedCount > 0) {
      return {
        icon: FiAlertCircle,
        text: `${syncStatus.failedCount} sync failed`,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        action: 'View Failed',
        onAction: () => setShowModal(true),
        priority: 'high',
        clickable: true
      }
    }

    if (syncStatus.highPriorityCount > 0) {
      return {
        icon: FiAlertTriangle,
        text: `${syncStatus.highPriorityCount} urgent changes pending`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        action: 'Sync Now',
        onAction: handleRetrySync,
        priority: 'high',
        clickable: true
      }
    }

    if (syncStatus.pendingCount > 0) {
      const estimatedTime = Math.ceil(syncStatus.estimatedSyncTime / 1000)
      return {
        icon: FiClock,
        text: `${syncStatus.pendingCount} pending (~${estimatedTime}s)`,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        action: 'Sync Now',
        onAction: handleRetrySync,
        priority: 'medium',
        clickable: true
      }
    }

    if (lastSync) {
      const lastSyncTime = new Date(lastSync)
      const now = new Date()
      const diffMinutes = Math.floor((now - lastSyncTime) / (1000 * 60))
      
      return {
        icon: FiCheckCircle,
        text: diffMinutes === 0 ? 'Just synced' : `Synced ${diffMinutes}m ago`,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        priority: 'low',
        clickable: showDetails
      }
    }

    return {
      icon: FiWifi,
      text: 'Online',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      priority: 'low',
      clickable: showDetails
    }
  }

  const config = getStatusConfig()

  // Don't show status when everything is synced and online (unless showDetails is true)
  if (!syncStatus.hasChanges && isOnline && !syncInProgress && !showDetails) {
    return null
  }

  const handleClick = () => {
    if (config.clickable && (syncStatus.hasChanges || showDetails)) {
      setShowModal(true)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} ${
          config.clickable ? 'cursor-pointer hover:opacity-80' : ''
        } ${className}`}
        onClick={handleClick}
      >
        <SafeIcon 
          icon={config.icon} 
          className={`w-3 h-3 mr-1.5 ${config.animate ? 'animate-spin' : ''}`} 
        />
        <span>{config.text}</span>
        
        {config.action && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              config.onAction()
            }}
            className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {config.action}
          </button>
        )}

        {showDetails && syncStatus.syncStats && (
          <div className="ml-2 text-xs opacity-75">
            ({syncStatus.syncStats.totalSynced} synced, {syncStatus.syncStats.totalFailed} failed, {syncStatus.syncStats.successRate}% success)
          </div>
        )}
      </motion.div>

      {/* Sync Status Modal */}
      <SyncStatusModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

export default SyncStatus