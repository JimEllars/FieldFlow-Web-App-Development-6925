import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStore } from '../../stores/offlineStore'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiWifi, FiWifiOff, FiRotateCw, FiCheckCircle, FiAlertCircle, FiClock, FiAlertTriangle, FiInfo, FiX, FiRefreshCw, FiTrash2 } = FiIcons

const SyncStatus = ({ className = '', showDetails = false }) => {
  const [showFailedChanges, setShowFailedChanges] = useState(false)
  const {
    isOnline,
    syncInProgress,
    pendingChanges,
    failedChanges,
    lastSync,
    processPendingChanges,
    retryFailedChange,
    retryAllFailedChanges,
    clearFailedChanges,
    forceSyncAll,
    getSyncStatus
  } = useOfflineStore()

  const syncStatus = getSyncStatus()

  const handleRetrySync = async () => {
    if (syncInProgress) return
    await processPendingChanges()
  }

  const handleForceSync = async () => {
    if (syncInProgress) return
    await forceSyncAll()
  }

  const handleRetryAll = () => {
    retryAllFailedChanges()
    setShowFailedChanges(false)
  }

  const handleClearFailed = () => {
    clearFailedChanges()
    setShowFailedChanges(false)
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: FiWifiOff,
        text: `Offline${syncStatus.pendingCount > 0 ? ` - ${syncStatus.pendingCount} changes pending` : ''}`,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        priority: 'low'
      }
    }

    if (syncInProgress) {
      return {
        icon: FiRotateCw,
        text: `Syncing ${syncStatus.pendingCount} changes...`,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        animate: true,
        priority: 'medium'
      }
    }

    if (syncStatus.failedCount > 0) {
      return {
        icon: FiAlertCircle,
        text: `${syncStatus.failedCount} sync failed`,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        action: 'View Failed',
        onAction: () => setShowFailedChanges(true),
        priority: 'high'
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
        priority: 'high'
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
        priority: 'medium'
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
        priority: 'low'
      }
    }

    return {
      icon: FiWifi,
      text: 'Online',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      priority: 'low'
    }
  }

  const config = getStatusConfig()

  // Don't show status when everything is synced and online (unless showDetails is true)
  if (!syncStatus.hasChanges && isOnline && !syncInProgress && !showDetails) {
    return null
  }

  return (
    <>
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

        {showDetails && syncStatus.syncStats && (
          <div className="ml-2 text-xs opacity-75">
            ({syncStatus.syncStats.totalSynced} synced, {syncStatus.syncStats.totalFailed} failed, {syncStatus.syncStats.successRate}% success)
          </div>
        )}
      </motion.div>

      {/* Enhanced Failed Changes Modal */}
      <AnimatePresence>
        {showFailedChanges && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity"
                onClick={() => setShowFailedChanges(false)}
              >
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
              </motion.div>

              {/* Modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              >
                <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-3">
                        <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Failed Sync Changes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {failedChanges.length} changes failed to sync
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFailedChanges(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Sync Statistics */}
                  {syncStatus.syncStats && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Sync Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {syncStatus.syncStats.successRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Avg Sync Time:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {Math.round(syncStatus.syncStats.averageSyncTime)}ms
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Synced:</span>
                          <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                            {syncStatus.syncStats.totalSynced}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Failed:</span>
                          <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                            {syncStatus.syncStats.totalFailed}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Failed Changes List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {failedChanges.map((change, index) => (
                      <div
                        key={change.id}
                        className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {change.type} {change.entity}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                Retry {change.retryCount}/3
                              </span>
                              {change.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                  High Priority
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                              {change.error}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Last failed: {new Date(change.lastFailedAt || change.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {change.retryCount < 3 && (
                            <button
                              onClick={() => retryFailedChange(change.id)}
                              className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                            >
                              <SafeIcon icon={FiRefreshCw} className="w-3 h-3 mr-1" />
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRetryAll}
                        disabled={syncInProgress}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                        Retry All
                      </button>
                      <button
                        onClick={handleForceSync}
                        disabled={syncInProgress}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <SafeIcon icon={FiRotateCw} className={`w-4 h-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
                        Force Sync All
                      </button>
                      <button
                        onClick={handleClearFailed}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                        Clear All
                      </button>
                    </div>
                    <button
                      onClick={() => setShowFailedChanges(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SyncStatus