import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useMyRequests } from '../../hooks/useMyRequests'
import Button from '../../components/common/Button'
import ErrorMessage from '../../components/common/ErrorMessage'
import LimitPreview from '../../components/requests/LimitPreview'
import { formatKRW } from '../../utils/formatKRW'

export default function RequestFormPage() {
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { submitRequest } = useMyRequests()

  const currentLimit = Number(profile?.current_limit) || 0
  const usedAmount = Number(profile?.used_amount) || 0

  const [requestedLimit, setRequestedLimit] = useState(currentLimit)
  const [percentInput, setPercentInput] = useState('0')
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const percentChange = currentLimit > 0 ? ((requestedLimit - currentLimit) / currentLimit) * 100 : 0
  const isInvalidLimit = requestedLimit <= usedAmount

  const handleAmountChange = (e) => {
    const value = Number(e.target.value)
    setRequestedLimit(value)
    if (currentLimit > 0) {
      setPercentInput((((value - currentLimit) / currentLimit) * 100).toFixed(1))
    }
  }

  const handlePercentChange = (e) => {
    const value = e.target.value
    setPercentInput(value)
    const percent = Number(value)
    if (!Number.isNaN(percent)) {
      setRequestedLimit(Math.round(currentLimit * (1 + percent / 100)))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: submitError } = await submitRequest({ requestedLimit, reason: reason.trim() })
    setSubmitting(false)

    if (submitError) {
      setError(submitError)
      return
    }

    navigate('/mypage', { state: { toast: '한도 조정 요청이 제출되었습니다.' } })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">한도 조정 요청</h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.unit_name} · {profile?.username}님 · 현재 한도 {formatKRW(currentLimit)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="requestedLimit" className="block text-sm font-medium text-gray-700">
              새 한도 (KRW)
            </label>
            <input
              id="requestedLimit"
              type="number"
              min="0"
              step="10000"
              value={requestedLimit}
              onChange={handleAmountChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label htmlFor="percentChange" className="block text-sm font-medium text-gray-700">
              증감률 (%)
            </label>
            <input
              id="percentChange"
              type="number"
              step="0.1"
              value={percentInput}
              onChange={handlePercentChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">변경 내용</p>
          <p className="mt-1 text-base font-medium text-gray-900">
            {formatKRW(currentLimit)} → {formatKRW(requestedLimit)}{' '}
            <span className={percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              ({percentChange >= 0 ? '+' : ''}
              {percentChange.toFixed(1)}%)
            </span>
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">사용률 변화 미리보기</p>
          <LimitPreview usedAmount={usedAmount} currentLimit={currentLimit} requestedLimit={requestedLimit} />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            요청 사유
          </label>
          <textarea
            id="reason"
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="한도 조정이 필요한 이유를 입력해주세요."
          />
        </div>

        {isInvalidLimit && <ErrorMessage message="새 한도는 현재 사용량보다 커야 합니다." />}
        <ErrorMessage message={error} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={submitting || isInvalidLimit || !reason.trim()}>
            {submitting ? '제출 중...' : '확인'}
          </Button>
        </div>
      </form>
    </div>
  )
}
