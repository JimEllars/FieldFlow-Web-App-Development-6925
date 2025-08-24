import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session?.user) {
          await setUserFromSession(session.user)
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          await setUserFromSession(session.user)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const setUserFromSession = async (authUser) => {
    try {
      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles_ff2024')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.user_metadata?.name || authUser.email,
        company: profile?.company || '',
        role: profile?.role || 'Owner',
        avatar: profile?.avatar_url || null,
        subscription: {
          plan: profile?.subscription_plan || 'trial',
          status: profile?.subscription_status || 'trial',
          expiresAt: profile?.subscription_expires_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error setting user from session:', error)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            company: userData.company
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // If registration successful but email confirmation required
      if (data.user && !data.session) {
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to confirm your account.',
          requiresConfirmation: true 
        }
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      // Clear local state
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

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

      if (!user?.id) {
        return { success: false, error: 'User not authenticated' }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles_ff2024')
        .update({
          name: profileData.name,
          company: profileData.company,
          role: profileData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }

      // Update local user state
      const updatedUser = {
        ...user,
        name: profileData.name,
        company: profileData.company,
        role: profileData.role
      }
      
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