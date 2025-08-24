import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}

export default ProtectedRoute