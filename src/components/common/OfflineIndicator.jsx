import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOffline } from '../../contexts/OfflineContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiWifiOff, FiRotateCw, FiCheckCircle, FiAlertCircle } = FiIcons

const OfflineIndicator = () => {
  const { isOnline, syncStatus, pendingChanges, lastSync } = useOffline()

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: FiWifiOff,
        text: pendingChanges > 0 
          ? `Offline - ${pendingChanges} changes pending`
          : 'Working offline',
        bgColor: 'bg-gray-600',
        textColor: 'text-white'
      }
    }

    if (syncStatus === 'syncing') {
      return {
        icon: FiRotateCw,
        text: 'Syncing changes...',
        bgColor: 'bg-primary-600',
        textColor: 'text-white',
        animate: true
      }
    }

    if (syncStatus === 'error') {
      return {
        icon: FiAlertCircle,
        text: 'Sync failed - Tap to retry',
        bgColor: 'bg-red-600',
        textColor: 'text-white'
      }
    }

    if (pendingChanges > 0) {
      return {
        icon: FiRotateCw,
        text: `${pendingChanges} changes pending sync`,
        bgColor: 'bg-warning-600',
        textColor: 'text-white'
      }
    }

    return null
  }

  const statusConfig = getStatusConfig()

  if (!statusConfig) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`${statusConfig.bgColor} ${statusConfig.textColor} px-4 py-2 text-sm font-medium text-center`}
      >
        <div className="flex items-center justify-center space-x-2">
          <SafeIcon 
            icon={statusConfig.icon} 
            className={`w-4 h-4 ${statusConfig.animate ? 'animate-spin' : ''}`} 
          />
          <span>{statusConfig.text}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OfflineIndicator