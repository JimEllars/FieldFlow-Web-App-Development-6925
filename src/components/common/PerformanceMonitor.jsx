import { useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'

const PerformanceMonitor = () => {
  const trackPerformance = useAppStore(state => state.trackPerformance)

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')
        
        getCLS(metric => trackPerformance({ cls: metric.value }))
        getFID(metric => trackPerformance({ fid: metric.value }))
        getFCP(metric => trackPerformance({ fcp: metric.value }))
        getLCP(metric => trackPerformance({ lcp: metric.value }))
        getTTFB(metric => trackPerformance({ ttfb: metric.value }))
      } catch (error) {
        console.warn('Web Vitals not available:', error)
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

    trackWebVitals()
    trackMemoryUsage()
    trackPageLoad()

    // Track performance every 30 seconds
    const interval = setInterval(() => {
      trackMemoryUsage()
    }, 30000)

    return () => clearInterval(interval)
  }, [trackPerformance])

  return null // This component doesn't render anything
}

export default PerformanceMonitor