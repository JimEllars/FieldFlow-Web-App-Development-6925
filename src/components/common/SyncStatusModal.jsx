import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStore } from '../../stores/offlineStore'
import { useAppStore } from '../../stores/appStore'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { 
  FiX, FiRefreshCw, FiTrash2, FiEye, FiAlertCircle, 
  FiCheckCircle, FiClock, FiWifi, FiWifiOff, FiActivity 
} = FiIcons

const SyncStatusModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('pending')
  const {
    pendingChanges,
    failedChanges,
    syncInProgress,
    isOnline,
    getSyncStatus,
    retryFailedChange,
    retryAllFailedChanges,
    clearFailedChanges,
    forceSyncAll,
    processPendingChanges
  } = useOfflineStore()

  const addNotification = useAppStore(state => state.addNotification)
  const syncStatus = getSyncStatus()

  const handleRetryChange = async (changeId) => {
    try {
      await retryFailedChange(changeId)
      addNotification({
        type: 'success',
        title: 'Retry Initiated',
        message: 'Change has been queued for retry'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: error.message
      })
    }
  }

  const handleRetryAll = async () => {
    try {
      await retryAllFailedChanges()
      addNotification({
        type: 'success',
        title: 'Retry All Initiated',
        message: 'All failed changes have been queued for retry'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Retry All Failed',
        message: error.message
      })
    }
  }

  const handleClearFailed = () => {
    clearFailedChanges()
    addNotification({
      type: 'success',
      title: 'Failed Changes Cleared',
      message: 'All failed changes have been removed'
    })
  }

  const handleForceSync = async () => {
    try {
      await forceSyncAll()
      addNotification({
        type: 'success',
        title: 'Force Sync Initiated',
        message: 'All changes are being synchronized'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Force Sync Failed',
        message: error.message
      })
    }
  }

  const formatChangeType = (change) => {
    const entityName = change.entity?.replace(/s$/, '') || 'item'
    return `${change.type} ${entityName}`
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'normal':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'low':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity"
              onClick={onClose}
            >
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
            </motion.div>

            {/* Modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
            >
              {/* Header */}
              <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <SafeIcon 
                        icon={isOnline ? FiWifi : FiWifiOff} 
                        className="w-6 h-6 text-primary-600 dark:text-primary-400" 
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Sync Status
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isOnline ? 'Connected' : 'Offline'} • {syncStatus.pendingCount} pending • {syncStatus.failedCount} failed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      isOnline 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      <SafeIcon icon={isOnline ? FiWifi : FiWifiOff} className="w-4 h-4" />
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    
                    {syncInProgress && (
                      <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <SafeIcon icon={FiRefreshCw} className="w-4 h-4 animate-spin" />
                        <span>Syncing...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleForceSync}
                      disabled={syncInProgress || !isOnline}
                      className="btn-secondary py-2 px-3 text-sm disabled:opacity-50"
                    >
                      <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-1" />
                      Force Sync
                    </button>
                  </div>
                </div>

                {/* Sync Statistics */}
                {syncStatus.syncStats && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {syncStatus.syncStats.totalSynced}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Synced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {syncStatus.syncStats.totalFailed}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {syncStatus.syncStats.successRate}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {Math.round(syncStatus.syncStats.averageSyncTime)}ms
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg Time</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'pending'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Pending ({pendingChanges.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('failed')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'failed'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Failed ({failedChanges.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                {activeTab === 'pending' ? (
                  <div className="space-y-3">
                    {pendingChanges.length === 0 ? (
                      <div className="text-center py-8">
                        <SafeIcon icon={FiCheckCircle} className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          All Caught Up!
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          No pending changes to synchronize
                        </p>
                      </div>
                    ) : (
                      pendingChanges.map((change, index) => (
                        <div
                          key={change.id}
                          className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {formatChangeType(change)}
                                </span>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(change.priority)}`}>
                                {change.priority}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {formatTimeAgo(change.timestamp)}
                              {change.estimatedDuration && (
                                <span className="ml-2">
                                  • ~{Math.round(change.estimatedDuration / 1000)}s
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failedChanges.length === 0 ? (
                      <div className="text-center py-8">
                        <SafeIcon icon={FiCheckCircle} className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No Failed Changes
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          All synchronization attempts have been successful
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {failedChanges.length} changes failed to synchronize
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleRetryAll}
                              disabled={syncInProgress}
                              className="btn-secondary py-1 px-2 text-xs"
                            >
                              Retry All
                            </button>
                            <button
                              onClick={handleClearFailed}
                              className="btn-secondary py-1 px-2 text-xs text-red-600"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                        
                        {failedChanges.map((change) => (
                          <div
                            key={change.id}
                            className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {formatChangeType(change)}
                                    </span>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(change.priority)}`}>
                                    {change.priority}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    Retry {change.retryCount}/3
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-red-700 dark:text-red-400">
                                    {change.error}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Last failed: {formatTimeAgo(change.lastFailedAt || change.timestamp)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-4">
                                <button
                                  onClick={() => console.log('Change details:', change)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="View Details"
                                >
                                  <SafeIcon icon={FiEye} className="w-4 h-4" />
                                </button>
                                {change.retryCount < 3 && (
                                  <button
                                    onClick={() => handleRetryChange(change.id)}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                                  >
                                    <SafeIcon icon={FiRefreshCw} className="w-3 h-3 mr-1" />
                                    Retry
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Connection: {syncStatus.connectionQuality?.level || 'unknown'}</span>
                    {syncStatus.estimatedSyncTime > 0 && (
                      <span>Est. sync time: ~{Math.ceil(syncStatus.estimatedSyncTime / 1000)}s</span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="btn-secondary py-2 px-4 text-sm"
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
  )
}

export default SyncStatusModal