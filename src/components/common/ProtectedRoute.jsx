import { Navigate } from 'react-router-dom'
import { hasRole } from '../../hooks/useRoleGuard'

function ProtectedRoute({ user, loading, roles, children }) {
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length > 0 && !hasRole(user, roles)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default ProtectedRoute
