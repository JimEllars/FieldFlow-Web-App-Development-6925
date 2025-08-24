import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored auth token on app load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('fieldflow-auth-token')
        const userData = localStorage.getItem('fieldflow-user-data')
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        // Clear invalid stored data
        localStorage.removeItem('fieldflow-auth-token')
        localStorage.removeItem('fieldflow-user-data')
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - replace with actual API response
      const mockUser = {
        id: '1',
        email,
        name: 'John Contractor',
        company: 'ABC Construction',
        role: 'Project Manager',
        avatar: null,
        subscription: {
          plan: 'professional',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Store auth data
      localStorage.setItem('fieldflow-auth-token', mockToken)
      localStorage.setItem('fieldflow-user-data', JSON.stringify(mockUser))
      
      setUser(mockUser)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Invalid credentials' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        company: userData.company,
        role: 'Owner',
        avatar: null,
        subscription: {
          plan: 'trial',
          status: 'trial',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      const token = 'mock-jwt-token-' + Date.now()
      
      localStorage.setItem('fieldflow-auth-token', token)
      localStorage.setItem('fieldflow-user-data', JSON.stringify(newUser))
      
      setUser(newUser)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Clear local storage
      localStorage.removeItem('fieldflow-auth-token')
      localStorage.removeItem('fieldflow-user-data')
      
      // Clear app state
      setUser(null)
      setIsAuthenticated(false)
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { success: false, error: 'Failed to send reset email' }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      
      const updatedUser = { ...user, ...profileData }
      localStorage.setItem('fieldflow-user-data', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Failed to update profile' }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}