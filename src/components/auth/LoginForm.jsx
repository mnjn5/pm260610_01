import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../common/Button'
import ErrorMessage from '../common/ErrorMessage'

export default function LoginForm() {
  const { signIn } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signIn({ email, password })

    setSubmitting(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : error)
      return
    }
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">이메일</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">비밀번호</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <ErrorMessage error={error} />
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  )
}
