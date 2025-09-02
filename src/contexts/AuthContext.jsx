import React, { createContext, useContext } from 'react'
import { useAuthStore } from '../stores/authStore'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Fallback to auth store if context is not available
    return useAuthStore()
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const authStore = useAuthStore()
  
  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  )
}