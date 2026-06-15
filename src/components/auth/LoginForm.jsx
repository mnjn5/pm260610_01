import { useState } from 'react'
import Button from '../common/Button'
import ErrorMessage from '../common/ErrorMessage'
import { useAuthContext } from '../../context/AuthContext'

export default function LoginForm() {
  const { signIn } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="••••••••"
        />
      </div>

      <ErrorMessage message={error} />

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  )
}
