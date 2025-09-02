import React, { createContext, useContext } from 'react'
import { useAppStore } from '../stores/appStore'

const ThemeContext = createContext({})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    // Fallback to app store if context is not available
    const { theme, setTheme } = useAppStore()
    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      setLightTheme: () => setTheme('light'),
      setDarkTheme: () => setTheme('dark'),
      isDark: theme === 'dark'
    }
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const { theme, setTheme } = useAppStore()
  
  const themeContext = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    setLightTheme: () => setTheme('light'),
    setDarkTheme: () => setTheme('dark'),
    isDark: theme === 'dark'
  }
  
  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  )
}