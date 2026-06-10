import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Spinner from '../common/Spinner'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />

  return children
}
