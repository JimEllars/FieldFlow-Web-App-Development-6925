import React, { lazy, Suspense, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useAppStore } from './stores/appStore'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoadingSpinner from './components/common/LoadingSpinner'
import NotificationSystem from './components/common/NotificationSystem'
import PerformanceMonitor from './components/common/PerformanceMonitor'

// Lazy load major components for code splitting
const AuthLayout = lazy(() => import('./components/layouts/AuthLayout'))
const AppLayout = lazy(() => import('./components/layouts/AppLayout'))
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'))

// Auth screens
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'))
const RegisterScreen = lazy(() => import('./screens/auth/RegisterScreen'))
const ForgotPasswordScreen = lazy(() => import('./screens/auth/ForgotPasswordScreen'))

// App screens
const DashboardScreen = lazy(() => import('./screens/dashboard/DashboardScreen'))
const ProjectsScreen = lazy(() => import('./screens/projects/ProjectsScreen'))
const ProjectDetailScreen = lazy(() => import('./screens/projects/ProjectDetailScreen'))
const CreateProjectScreen = lazy(() => import('./screens/projects/CreateProjectScreen'))
const TasksScreen = lazy(() => import('./screens/tasks/TasksScreen'))
const TaskDetailScreen = lazy(() => import('./screens/tasks/TaskDetailScreen'))
const CreateTaskScreen = lazy(() => import('./screens/tasks/CreateTaskScreen'))
const ScheduleScreen = lazy(() => import('./screens/schedule/ScheduleScreen'))
const DailyLogsScreen = lazy(() => import('./screens/dailyLogs/DailyLogsScreen'))
const CreateDailyLogScreen = lazy(() => import('./screens/dailyLogs/CreateDailyLogScreen'))
const TimeTrackingScreen = lazy(() => import('./screens/timeTracking/TimeTrackingScreen'))
const DocumentsScreen = lazy(() => import('./screens/documents/DocumentsScreen'))
const UploadDocumentScreen = lazy(() => import('./screens/documents/UploadDocumentScreen'))
const DocumentViewerScreen = lazy(() => import('./screens/documents/DocumentViewerScreen'))
const ProfileScreen = lazy(() => import('./screens/profile/ProfileScreen'))
const SettingsScreen = lazy(() => import('./screens/settings/SettingsScreen'))

// Enhanced features
const ClientsScreen = lazy(() => import('./screens/clients/ClientsScreen'))
const ClientDetailScreen = lazy(() => import('./screens/clients/ClientDetailScreen'))
const CreateClientScreen = lazy(() => import('./screens/clients/CreateClientScreen'))
const BillingScreen = lazy(() => import('./screens/billing/BillingScreen'))

function App() {
  const { theme, setTheme } = useAppStore()
  const { isAuthenticated, initializeAuth } = useAuthStore()

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth()
  }, [])

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('fieldflow-theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (systemPrefersDark) {
      setTheme('dark')
    }
  }, [setTheme])

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner text="Loading FieldFlow..." />}>
          <Routes>
            {/* Authentication Routes */}
            <Route 
              path="/auth/*" 
              element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthLayout />}
            >
              <Route path="login" element={<LoginScreen />} />
              <Route path="register" element={<RegisterScreen />} />
              <Route path="forgot-password" element={<ForgotPasswordScreen />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Protected App Routes */}
            <Route 
              path="/app/*" 
              element={
                <Suspense fallback={<LoadingSpinner text="Loading app..." />}>
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* Core App Screens */}
              <Route path="dashboard" element={<DashboardScreen />} />
              
              {/* Project Management */}
              <Route path="projects" element={<ProjectsScreen />} />
              <Route path="projects/new" element={<CreateProjectScreen />} />
              <Route path="projects/:id" element={<ProjectDetailScreen />} />
              
              {/* Client Management (CRM) */}
              <Route path="clients" element={<ClientsScreen />} />
              <Route path="clients/new" element={<CreateClientScreen />} />
              <Route path="clients/:clientId" element={<ClientDetailScreen />} />
              
              {/* Task Management */}
              <Route path="tasks" element={<TasksScreen />} />
              <Route path="tasks/new" element={<CreateTaskScreen />} />
              <Route path="tasks/:id" element={<TaskDetailScreen />} />
              
              {/* Schedule */}
              <Route path="schedule" element={<ScheduleScreen />} />
              
              {/* Daily Logs */}
              <Route path="daily-logs" element={<DailyLogsScreen />} />
              <Route path="daily-logs/new" element={<CreateDailyLogScreen />} />
              
              {/* Time Tracking */}
              <Route path="time-tracking" element={<TimeTrackingScreen />} />
              
              {/* Document Management */}
              <Route path="documents" element={<DocumentsScreen />} />
              <Route path="documents/upload" element={<UploadDocumentScreen />} />
              <Route path="documents/:id" element={<DocumentViewerScreen />} />
              
              {/* User Management */}
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              
              {/* Billing */}
              <Route path="billing" element={<BillingScreen />} />
            </Route>

            {/* Root redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to="/app" replace /> : 
                <Navigate to="/auth/login" replace />
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global Components */}
        <NotificationSystem />
        <PerformanceMonitor />
      </Router>
    </ErrorBoundary>
  )
}

export default App