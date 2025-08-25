import { useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'

const PerformanceMonitor = () => {
  const trackPerformance = useAppStore(state => state.trackPerformance)

  useEffect(() => {
    // Track Core Web Vitals with better error handling
    const trackWebVitals = async () => {
      try {
        // Only load web-vitals in production or when explicitly enabled
        if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
          // Dynamic import with error handling
          const webVitals = await import('web-vitals').catch(() => null)
          
          if (webVitals) {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals
            
            getCLS(metric => trackPerformance({ cls: metric.value }))
            getFID(metric => trackPerformance({ fid: metric.value }))
            getFCP(metric => trackPerformance({ fcp: metric.value }))
            getLCP(metric => trackPerformance({ lcp: metric.value }))
            getTTFB(metric => trackPerformance({ ttfb: metric.value }))
          } else {
            console.debug('Web Vitals library not available')
          }
        }
      } catch (error) {
        // Silently fail if web-vitals is not available
        console.debug('Performance monitoring not available:', error.message)
      }
    }

    // Track memory usage
    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = performance.memory
        trackPerformance({
          memoryUsed: memory.usedJSHeapSize,
          memoryTotal: memory.totalJSHeapSize,
          memoryLimit: memory.jsHeapSizeLimit
        })
      }
    }

    // Track page load time
    const trackPageLoad = () => {
      if ('navigation' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          trackPerformance({
            pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
          })
        }
      }
    }

    // Track connection information
    const trackConnection = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection
        trackPerformance({
          connectionType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        })
      }
    }

    // Initialize tracking
    trackWebVitals()
    trackMemoryUsage()
    trackPageLoad()
    trackConnection()

    // Track performance every 30 seconds
    const interval = setInterval(() => {
      trackMemoryUsage()
      trackConnection()
    }, 30000)

    return () => clearInterval(interval)
  }, [trackPerformance])

  return null // This component doesn't render anything
}

export default PerformanceMonitor