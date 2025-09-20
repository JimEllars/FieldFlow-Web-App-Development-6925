import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/appStore'

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState(null)
  const addNotification = useAppStore(state => state.addNotification)

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setRegistration(reg)
      setIsRegistered(true)

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setUpdateAvailable(true)
              addNotification({
                type: 'info',
                title: 'App Update Available',
                message: 'A new version of ForemanOS is available. Refresh to update.',
                duration: 10000
              })
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data || {}

        switch (type) {
          case 'SYNC_COMPLETE':
            addNotification({
              type: 'success',
              title: 'Sync Complete',
              message: `${data?.processed || 0} changes synced successfully`,
              duration: 3000
            })
            break
          case 'SYNC_ERROR':
            addNotification({
              type: 'error',
              title: 'Sync Failed',
              message: 'Some changes could not be synced. Please try again.',
              duration: 5000
            })
            break
          default:
            break
        }
      })

      console.log('Service Worker registered successfully')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const updateApp = async () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Refresh the page to load the new version
      window.location.reload()
    }
  }

  const requestBackgroundSync = (tag = 'foremanos-sync') => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register(tag)
      }).catch((error) => {
        console.error('Background sync registration failed:', error)
      })
    }
  }

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateApp,
    requestBackgroundSync
  }
}