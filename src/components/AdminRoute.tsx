import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userRole, loading } = useAuth()

  console.log('AdminRoute check:', { user, userRole, loading })

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (userRole !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default AdminRoute