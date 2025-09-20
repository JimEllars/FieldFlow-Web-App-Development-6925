// Performance utilities for optimization
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const memoize = (fn) => {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Lazy load images
export const lazyLoadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = reject
    img.src = src
  })
}

// Check if device is low-end
export const isLowEndDevice = () => {
  // Check memory
  if ('memory' in navigator && navigator.memory.deviceMemory < 4) {
    return true
  }

  // Check connection
  if ('connection' in navigator) {
    const conn = navigator.connection
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      return true
    }
  }

  // Check hardware concurrency
  if (navigator.hardwareConcurrency < 4) {
    return true
  }

  return false
}

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/foremanos-icon.svg'
    // Add other critical resources
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.endsWith('.svg') ? 'image' : 'fetch'
    document.head.appendChild(link)
  })
}

// Bundle size analyzer helper
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    console.log('Bundle analysis is only available in production build')
    return
  }

  // This would integrate with bundle analyzer
  console.log('Use `npm run analyze` to analyze bundle size')
}