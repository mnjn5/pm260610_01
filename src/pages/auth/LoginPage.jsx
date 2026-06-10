import { Link } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm text-gray-700">
        계정이 없으신가요? <Link to="/register" className="font-medium text-primary hover:underline">회원가입</Link>
      </p>
    </section>
  )
}
