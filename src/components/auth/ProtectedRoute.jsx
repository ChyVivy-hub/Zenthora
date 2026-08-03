import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        color: 'var(--text-muted)',
        fontSize: '1rem'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    if (requiredRole === 'staff') {
      return <Navigate to="/staff-login" replace />
    }
    if (requiredRole === 'manager') {
      return <Navigate to="/manager-login" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'manager') return <Navigate to="/manager" replace />
    if (user.role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/dashboard" replace />
  }

  if (requiredRole === 'staff' && user.status !== 'approved') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        color: 'var(--text-secondary)'
      }}>
        <h2>Pending Approval</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Your staff account is awaiting manager approval.
        </p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute