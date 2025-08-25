import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiRefreshCw, FiChevronDown } = FiIcons

const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80, 
  disabled = false,
  className = '' 
}) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  
  const containerRef = useRef(null)
  const controls = useAnimation()

  // Handle touch start
  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    setStartY(e.touches[0].clientY)
  }

  // Handle touch move
  const handleTouchMove = (e) => {
    if (disabled || isRefreshing || startY === 0) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    
    if (distance > 0) {
      e.preventDefault()
      const pullDistance = Math.min(distance * 0.5, threshold * 1.5)
      setPullDistance(pullDistance)
      setIsPulling(pullDistance > 20)
    }
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (disabled || isRefreshing) return
    
    if (pullDistance >= threshold) {
      triggerRefresh()
    } else {
      resetPull()
    }
    
    setStartY(0)
  }

  // Trigger refresh
  const triggerRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    
    try {
      await controls.start({
        y: threshold,
        transition: { duration: 0.2 }
      })
      
      if (onRefresh) {
        await onRefresh()
      }
      
      // Show success state briefly
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      resetPull()
      setIsRefreshing(false)
    }
  }

  // Reset pull state
  const resetPull = async () => {
    await controls.start({
      y: 0,
      transition: { duration: 0.3 }
    })
    
    setPullDistance(0)
    setIsPulling(false)
  }

  // Calculate refresh indicator state
  const getRefreshState = () => {
    if (isRefreshing) return 'refreshing'
    if (pullDistance >= threshold) return 'ready'
    if (isPulling) return 'pulling'
    return 'idle'
  }

  const refreshState = getRefreshState()
  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        touchAction: isPulling ? 'none' : 'auto',
        overscrollBehavior: 'none'
      }}
    >
      {/* Pull indicator */}
      <motion.div
        animate={controls}
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{ 
          height: Math.max(pullDistance, isRefreshing ? threshold : 0),
          marginTop: -threshold 
        }}
      >
        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg p-4">
          {refreshState === 'refreshing' ? (
            <>
              <SafeIcon 
                icon={FiRefreshCw} 
                className="w-6 h-6 text-primary-600 animate-spin" 
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Refreshing...
              </span>
            </>
          ) : refreshState === 'ready' ? (
            <>
              <SafeIcon 
                icon={FiRefreshCw} 
                className="w-6 h-6 text-green-600" 
              />
              <span className="text-xs text-green-600 mt-1 font-medium">
                Release to refresh
              </span>
            </>
          ) : refreshState === 'pulling' ? (
            <>
              <motion.div
                animate={{ rotate: progress * 180 }}
                transition={{ duration: 0.1 }}
              >
                <SafeIcon 
                  icon={FiChevronDown} 
                  className="w-6 h-6 text-gray-400" 
                />
              </motion.div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Pull to refresh
              </span>
            </>
          ) : null}
          
          {/* Progress indicator */}
          {(isPulling || isRefreshing) && (
            <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: isRefreshing ? '100%' : `${progress * 100}%` 
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={controls}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}

export default PullToRefresh