import React from 'react'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiAlertTriangle, FiRefreshCw } = FiIcons

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <SafeIcon 
                    icon={FiAlertTriangle} 
                    className="w-8 h-8 text-red-600 dark:text-red-400" 
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary