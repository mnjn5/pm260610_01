import { Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import Spinner from '../components/common/Spinner'
import { useAuthContext } from '../context/AuthContext'

export default function LoginPage() {
  const { session, role, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (session && role) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">토큰풀 관리</h1>
          <p className="mt-1 text-sm text-gray-500">계정 정보를 입력해 로그인하세요.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
