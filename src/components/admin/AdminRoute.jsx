import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import Spinner from '../common/Spinner'

export default function AdminRoute({ children }) {
  const { user, role, loading } = useAuthContext()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role !== ROLES.ADMIN) return <Navigate to="/" replace />

  return children
}
