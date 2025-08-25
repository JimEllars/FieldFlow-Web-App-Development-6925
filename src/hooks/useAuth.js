import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addNotification = useAppStore(state => state.addNotification)

  // Test Mode - Enable for development
  const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        if (TEST_MODE) {
          // Test mode - check localStorage
          const testUser = localStorage.getItem('fieldflow-test-user')
          if (testUser) {
            const userData = JSON.parse(testUser)
            setUser(userData)
          }
          setLoading(false)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session?.user) {
          await setUserFromSession(session.user)
        }
      } catch (error) {
        console.error('Session error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes (production only)
    if (!TEST_MODE) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await setUserFromSession(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [TEST_MODE])

  const setUserFromSession = async (authUser) => {
    try {
      // Get user profile from database
      const { data: profile, error } = await supabase
        .from('profiles_ff2024')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error)
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
          expiresAt: profile?.subscription_expires_at || 
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      setUser(userData)
    } catch (error) {
      console.error('User session error:', error)
      setError(error.message)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      if (TEST_MODE) {
        // Test mode authentication
        const testUser = {
          id: `test-${Date.now()}`,
          email,
          name: email.split('@')[0] || 'Test User',
          company: 'Test Company',
          role: 'Owner',
          avatar: null,
          subscription: {
            plan: 'professional',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }

        localStorage.setItem('fieldflow-test-user', JSON.stringify(testUser))
        setUser(testUser)
        
        addNotification({
          type: 'success',
          title: 'Welcome to FieldFlow!',
          message: 'You are now logged in (Test Mode)'
        })

        return { success: true, user: testUser }
      }

      // Production authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in'
      })

      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      setError(errorMessage)
      
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage
      })

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      if (TEST_MODE) {
        localStorage.removeItem('fieldflow-test-user')
        setUser(null)
        return { success: true }
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      
      // Clear app cache
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    testMode: TEST_MODE
  }
}