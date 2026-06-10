import { Link } from 'react-router-dom'
import RegisterForm from '../../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-gray-700">
        이미 계정이 있으신가요? <Link to="/login" className="font-medium text-primary hover:underline">로그인</Link>
      </p>
    </section>
  )
}
