import React, { Suspense, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { OfflineProvider } from './contexts/OfflineContext'
import { DataProvider } from './contexts/DataContext'
import { OptimisticUIProvider } from './components/common/OptimisticUI'
import ErrorBoundary from './components/common/ErrorBoundary'
import NotificationSystem from './components/common/NotificationSystem'
import PerformanceMonitor from './components/common/PerformanceMonitor'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { preloadCriticalResources } from './utils/performance'
import { useAppStore } from './stores/appStore'
import { useServiceWorker } from './hooks/useServiceWorker'
import { startAutoSync } from './stores/offlineStore'

// Lazy load all screens for optimal performance
const AuthLayout = React.lazy(() => import('./components/layouts/AuthLayout'))
const AppLayout = React.lazy(() => import('./components/layouts/AppLayout'))
const LoginScreen = React.lazy(() => import('./screens/auth/LoginScreen'))
const RegisterScreen = React.lazy(() => import('./screens/auth/RegisterScreen'))
const ForgotPasswordScreen = React.lazy(() => import('./screens/auth/ForgotPasswordScreen'))
const DashboardScreen = React.lazy(() => import('./screens/dashboard/DashboardScreen'))
const ProjectsScreen = React.lazy(() => import('./screens/projects/ProjectsScreen'))
const ProjectDetailScreen = React.lazy(() => import('./screens/projects/ProjectDetailScreen'))
const CreateProjectScreen = React.lazy(() => import('./screens/projects/CreateProjectScreen'))
const ScheduleScreen = React.lazy(() => import('./screens/schedule/ScheduleScreen'))
const TasksScreen = React.lazy(() => import('./screens/tasks/TasksScreen'))
const TaskDetailScreen = React.lazy(() => import('./screens/tasks/TaskDetailScreen'))
const CreateTaskScreen = React.lazy(() => import('./screens/tasks/CreateTaskScreen'))
const DailyLogsScreen = React.lazy(() => import('./screens/dailyLogs/DailyLogsScreen'))
const CreateDailyLogScreen = React.lazy(() => import('./screens/dailyLogs/CreateDailyLogScreen'))
const TimeTrackingScreen = React.lazy(() => import('./screens/timeTracking/TimeTrackingScreen'))
const DocumentsScreen = React.lazy(() => import('./screens/documents/DocumentsScreen'))
const DocumentViewerScreen = React.lazy(() => import('./screens/documents/DocumentViewerScreen'))
const UploadDocumentScreen = React.lazy(() => import('./screens/documents/UploadDocumentScreen'))
const ProfileScreen = React.lazy(() => import('./screens/profile/ProfileScreen'))
const SettingsScreen = React.lazy(() => import('./screens/settings/SettingsScreen'))
const BillingScreen = React.lazy(() => import('./screens/billing/BillingScreen'))

function App() {
  const theme = useAppStore(state => state.theme)
  const { isSupported: swSupported, requestBackgroundSync } = useServiceWorker()

  useEffect(() => {
    // Preload critical resources on app start
    preloadCriticalResources()

    // Set initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark')

    // Start auto-sync for offline functionality
    startAutoSync()

    // Register for background sync if supported
    if (swSupported) {
      requestBackgroundSync()
    }
  }, [theme, swSupported, requestBackgroundSync])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <OfflineProvider>
            <AuthProvider>
              <DataProvider>
                <OptimisticUIProvider>
                  <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      {/* Performance monitoring */}
                      <PerformanceMonitor />
                      
                      {/* Global notification system */}
                      <NotificationSystem />
                      
                      <Suspense fallback={<LoadingSpinner text="Loading FieldFlow..." />}>
                        <Routes>
                          {/* Auth Routes */}
                          <Route path="/auth" element={<AuthLayout />}>
                            <Route path="login" element={<LoginScreen />} />
                            <Route path="register" element={<RegisterScreen />} />
                            <Route path="forgot-password" element={<ForgotPasswordScreen />} />
                            <Route index element={<Navigate to="login" replace />} />
                          </Route>

                          {/* Protected App Routes */}
                          <Route 
                            path="/app" 
                            element={
                              <ProtectedRoute>
                                <AppLayout />
                              </ProtectedRoute>
                            }
                          >
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardScreen />} />
                            
                            {/* Projects */}
                            <Route path="projects" element={<ProjectsScreen />} />
                            <Route path="projects/new" element={<CreateProjectScreen />} />
                            <Route path="projects/:projectId" element={<ProjectDetailScreen />} />
                            
                            {/* Schedule */}
                            <Route path="schedule" element={<ScheduleScreen />} />
                            
                            {/* Tasks */}
                            <Route path="tasks" element={<TasksScreen />} />
                            <Route path="tasks/new" element={<CreateTaskScreen />} />
                            <Route path="tasks/:taskId" element={<TaskDetailScreen />} />
                            
                            {/* Daily Logs */}
                            <Route path="daily-logs" element={<DailyLogsScreen />} />
                            <Route path="daily-logs/new" element={<CreateDailyLogScreen />} />
                            
                            {/* Time Tracking */}
                            <Route path="time-tracking" element={<TimeTrackingScreen />} />
                            
                            {/* Documents */}
                            <Route path="documents" element={<DocumentsScreen />} />
                            <Route path="documents/upload" element={<UploadDocumentScreen />} />
                            <Route path="documents/:documentId" element={<DocumentViewerScreen />} />
                            
                            {/* Profile & Settings */}
                            <Route path="profile" element={<ProfileScreen />} />
                            <Route path="settings" element={<SettingsScreen />} />
                            <Route path="billing" element={<BillingScreen />} />
                          </Route>

                          {/* Default redirect */}
                          <Route path="/" element={<Navigate to="/app" replace />} />
                          <Route path="*" element={<Navigate to="/app" replace />} />
                        </Routes>
                      </Suspense>
                    </div>
                  </Router>
                </OptimisticUIProvider>
              </DataProvider>
            </AuthProvider>
          </OfflineProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App