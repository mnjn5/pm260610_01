import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../common/Button'
import ErrorMessage from '../common/ErrorMessage'

export default function RegisterForm() {
  const { signUp } = useAuthContext()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signUp({ email, password, username, phone, address })

    setSubmitting(false)
    if (error) {
      setError(error.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : error)
      return
    }
    navigate('/login')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">사용자명</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <p className="mt-1 text-xs text-gray-500">6자 이상 입력해주세요.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">전화번호</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000"
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">주소</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <ErrorMessage error={error} />
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  )
}
