import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiAlertTriangle, FiRefreshCw, FiHome, FiMail } = FiIcons

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const isDevelopment = import.meta.env.DEV

  const getErrorMessage = (error) => {
    if (error?.name === 'ChunkLoadError') {
      return {
        title: 'App Update Available',
        message: 'A new version of FieldFlow is available. Please refresh the page to update.',
        action: 'Refresh Page',
        actionFn: () => window.location.reload()
      }
    }

    if (error?.message?.includes('Network')) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to FieldFlow services. Please check your internet connection.',
        action: 'Retry',
        actionFn: resetErrorBoundary
      }
    }

    if (error?.message?.includes('Supabase')) {
      return {
        title: 'Database Connection Error',
        message: 'Unable to connect to the database. Please try again in a moment.',
        action: 'Retry',
        actionFn: resetErrorBoundary
      }
    }

    return {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Our team has been notified.',
      action: 'Try Again',
      actionFn: resetErrorBoundary
    }
  }

  const errorInfo = getErrorMessage(error)

  // Log error to external service in production
  React.useEffect(() => {
    if (!isDevelopment) {
      // In production, send error to logging service
      console.error('ErrorBoundary caught error:', error)
      
      // Example: Send to error tracking service
      // errorTracker.captureException(error, {
      //   user: user?.email,
      //   timestamp: new Date().toISOString(),
      //   userAgent: navigator.userAgent,
      //   url: window.location.href
      // })
    }
  }, [error, isDevelopment])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorInfo.message}
          </p>

          {/* Development Error Details */}
          {isDevelopment && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-left">
              <p className="text-xs font-mono text-red-800 dark:text-red-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={errorInfo.actionFn}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
              {errorInfo.action}
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors duration-200"
            >
              <SafeIcon icon={FiHome} className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact{' '}
              <a 
                href="mailto:support@aximsystems.com" 
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                support@aximsystems.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary