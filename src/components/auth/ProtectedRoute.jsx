import { Navigate } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { useAuthContext } from '../../context/AuthContext'

const DEFAULT_REDIRECT = '/chat'

export default function ProtectedRoute({ role, children }) {
  const { session, role: userRole, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={DEFAULT_REDIRECT} replace />
  }

  return children
}
