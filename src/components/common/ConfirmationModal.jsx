import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiAlertTriangle, FiTrash2, FiCheck, FiX } = FiIcons

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return FiTrash2
      case 'info':
        return FiCheck
      default:
        return FiAlertTriangle
    }
  }

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          buttonFocus: 'focus:ring-red-500'
        }
      case 'info':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          buttonFocus: 'focus:ring-blue-500'
        }
      default:
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          buttonFocus: 'focus:ring-yellow-500'
        }
    }
  }

  const colors = getColors()
  const IconComponent = getIcon()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${colors.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                    <SafeIcon icon={IconComponent} className={`h-6 w-6 ${colors.iconColor}`} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${colors.buttonBg} text-base font-medium text-white ${colors.buttonFocus} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50`}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal