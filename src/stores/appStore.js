import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Global app store using Zustand for better state management
export const useAppStore = create(
  persist(
    immer((set, get) => ({
      // UI State
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      
      // User Preferences
      preferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      },

      // Performance tracking
      performance: {
        lastSync: null,
        cacheSize: 0,
        offlineActions: []
      },

      // Actions
      setTheme: (theme) => set((state) => {
        state.theme = theme
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }),

      toggleSidebar: () => set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed
      }),

      addNotification: (notification) => set((state) => {
        const id = Date.now().toString()
        state.notifications.push({
          id,
          timestamp: new Date().toISOString(),
          ...notification
        })
      }),

      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id)
      }),

      updatePreferences: (newPreferences) => set((state) => {
        state.preferences = { ...state.preferences, ...newPreferences }
      }),

      trackPerformance: (metrics) => set((state) => {
        state.performance = { ...state.performance, ...metrics }
      })
    })),
    {
      name: 'fieldflow-app-store',
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)