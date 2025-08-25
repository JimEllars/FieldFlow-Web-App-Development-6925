class ErrorLogger {
  constructor() {
    this.isProduction = import.meta.env.PROD
    this.errorQueue = []
    this.maxQueueSize = 50
  }

  log(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
      id: this.generateId()
    }

    // Add to queue
    this.errorQueue.push(errorEntry)
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error logged:', errorEntry)
    }

    // In production, send to external service
    if (this.isProduction) {
      this.sendToExternalService(errorEntry)
    }
  }

  async sendToExternalService(errorEntry) {
    try {
      // Example: Send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorEntry)
      // })
      
      // For now, store in localStorage for later retrieval
      const storedErrors = JSON.parse(localStorage.getItem('fieldflow-errors') || '[]')
      storedErrors.push(errorEntry)
      
      // Keep only last 20 errors
      if (storedErrors.length > 20) {
        storedErrors.splice(0, storedErrors.length - 20)
      }
      
      localStorage.setItem('fieldflow-errors', JSON.stringify(storedErrors))
    } catch (err) {
      console.warn('Failed to log error to external service:', err)
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getErrorQueue() {
    return [...this.errorQueue]
  }

  clearErrorQueue() {
    this.errorQueue = []
  }
}

export const errorLogger = new ErrorLogger()

// Global error handler
window.addEventListener('error', (event) => {
  errorLogger.log(event.error, {
    type: 'javascript_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorLogger.log(new Error(event.reason), {
    type: 'unhandled_promise_rejection'
  })
})

export default errorLogger