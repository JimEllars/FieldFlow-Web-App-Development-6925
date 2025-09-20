import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { useAppStore } from './appStore'

// Centralized auth store replacing AuthContext
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      loading: false,
      isAuthenticated: false,
      session: null,
      
      // Test mode configuration - now dynamic based on environment
      testMode: import.meta.env.VITE_TEST_MODE === 'true',
      
      // Actions
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      
      // Enhanced login with better error handling
      login: async (email, password) => {
        set({ loading: true, error: null })
        
        try {
          const { testMode } = get()
          
          if (testMode) {
            // Enhanced test mode with realistic demo data
            console.log('🧪 TEST MODE: Accepting login credentials')
            
            let testUser
            if (email === 'demo@foremanos.com' && password === 'demo123456') {
              testUser = {
                id: 'demo-user-001',
                email: 'demo@foremanos.com',
                name: 'John Contractor',
                company: 'Demo Construction Co.',
                company_id: '123e4567-e89b-12d3-a456-426614174000',
                role: 'admin',
                avatar: null,
                subscription: {
                  plan: 'professional',
                  status: 'active',
                  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
              }
            } else {
              // Create test user for any other credentials
              testUser = {
                id: `test-${Date.now()}`,
                email: email,
                name: email.split('@')[0] || 'Test User',
                company: 'Test Company',
                company_id: `company-${Date.now()}`,
                role: 'admin',
                avatar: null,
                subscription: {
                  plan: 'professional',
                  status: 'active',
                  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
              }
            }
            
            // Store test user
            localStorage.setItem('foremanos-test-user', JSON.stringify(testUser))
            set({ user: testUser, isAuthenticated: true, loading: false })
            
            // Show success notification
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Welcome to ForemanOS!',
              message: testMode ? 'You are now logged in (Test Mode)' : 'Login successful'
            })
            
            return { success: true, user: testUser }
          }
          
          // Production mode - use Supabase auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }
          
          if (data.user) {
            await get().setUserFromSession(data.user)
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Welcome back!',
              message: 'You have successfully logged in'
            })
          }
          
          set({ loading: false })
          return { success: true, user: data.user }
        } catch (error) {
          console.error('Login error:', error)
          set({ loading: false })
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Login Failed',
            message: error.message || 'An unexpected error occurred'
          })
          return { success: false, error: error.message }
        }
      },
      
      // Enhanced registration
      register: async (userData) => {
        set({ loading: true })
        
        try {
          const { testMode } = get()
          
          if (testMode) {
            console.log('🧪 TEST MODE: Simulating registration')
            
            const testUser = {
              id: `test-${Date.now()}`,
              email: userData.email,
              name: userData.name,
              company: userData.company,
              company_id: `company-${Date.now()}`,
              role: 'admin',
              avatar: null,
              subscription: {
                plan: 'trial',
                status: 'trial',
                expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
            
            localStorage.setItem('foremanos-test-user', JSON.stringify(testUser))
            set({ user: testUser, isAuthenticated: true, loading: false })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Account Created!',
              message: 'Welcome to ForemanOS'
            })
            
            return { success: true, user: testUser }
          }
          
          // Production mode
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
          
          set({ loading: false })
          
          if (error) {
            return { success: false, error: error.message }
          }
          
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
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },
      
      // Enhanced logout with cleanup
      logout: async () => {
        set({ loading: true })
        
        try {
          const { testMode } = get()
          
          if (testMode) {
            localStorage.removeItem('foremanos-test-user')
          } else {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
          }
          
          // Clear all app data
          set({
            user: null,
            isAuthenticated: false,
            session: null,
            loading: false
          })
          
          // Clear cache and offline data
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(name => caches.delete(name)))
          }
          
          return { success: true }
        } catch (error) {
          console.error('Logout error:', error)
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },
      
      // Set user from Supabase session
      setUserFromSession: async (authUser) => {
        try {
          // Get user profile from database
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
            company_id: profile?.company_id || null,
            role: profile?.role || 'admin',
            avatar: profile?.avatar_url || null,
            subscription: {
              plan: profile?.subscription_plan || 'trial',
              status: profile?.subscription_status || 'trial',
              expiresAt: profile?.subscription_expires_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
          
          set({ user: userData, isAuthenticated: true })
          return userData
        } catch (error) {
          console.error('Error setting user from session:', error)
          throw error
        }
      },
      
      // Update user profile
      updateProfile: async (profileData) => {
        set({ loading: true })
        
        try {
          const { user, testMode } = get()
          
          if (!user?.id) {
            throw new Error('User not authenticated')
          }
          
          if (testMode) {
            // Update test user in localStorage
            const updatedUser = {
              ...user,
              name: profileData.name,
              company: profileData.company,
              role: profileData.role
            }
            
            localStorage.setItem('foremanos-test-user', JSON.stringify(updatedUser))
            set({ user: updatedUser, loading: false })
            
            return { success: true }
          }
          
          // Production mode
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
            set({ loading: false })
            return { success: false, error: error.message }
          }
          
          // Update local user state
          const updatedUser = {
            ...user,
            name: profileData.name,
            company: profileData.company,
            role: profileData.role
          }
          
          set({ user: updatedUser, loading: false })
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Profile Updated',
            message: 'Your profile has been successfully updated'
          })
          
          return { success: true }
        } catch (error) {
          console.error('Profile update error:', error)
          set({ loading: false })
          return { success: false, error: error.message }
        }
      },
      
      // Initialize auth state on app start
      initializeAuth: async () => {
        set({ loading: true })
        
        try {
          const { testMode } = get()
          
          if (testMode) {
            // Check for test user in localStorage
            const testUser = localStorage.getItem('foremanos-test-user')
            if (testUser) {
              const userData = JSON.parse(testUser)
              set({ user: userData, isAuthenticated: true, loading: false })
              return userData
            }
          } else {
            // Get current session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
              console.error('Error getting session:', error)
            } else if (session?.user) {
              await get().setUserFromSession(session.user)
              set({ loading: false })
              return session.user
            }
          }
          
          set({ loading: false })
          return null
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ loading: false })
          return null
        }
      }
    }),
    {
      name: 'foremanos-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        testMode: state.testMode
      })
    }
  )
)

// Initialize auth on module load
useAuthStore.getState().initializeAuth()

export default useAuthStore