import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useMyRequests } from '../../hooks/useMyRequests'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import UsageProgressBar from '../../components/common/UsageProgressBar'
import RequestSummaryCard from '../../components/requests/RequestSummaryCard'
import { formatKRW } from '../../utils/formatKRW'

export default function MyPage() {
  const { profile } = useAuthContext()
  const { requests, loading, error } = useMyRequests()
  const location = useLocation()
  const toast = location.state?.toast

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-lg font-semibold text-gray-900">내 현황</h1>

      {toast && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
          {toast}
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">현재 한도</p>
            <p className="text-2xl font-semibold text-gray-900">{formatKRW(profile?.current_limit)}</p>
          </div>
          <Link to="/mypage/request">
            <Button>한도 조정 요청</Button>
          </Link>
        </div>
        <div className="mt-4">
          <UsageProgressBar
            used={profile?.used_amount ?? 0}
            limit={profile?.current_limit ?? 0}
            label={`사용량 ${formatKRW(profile?.used_amount)} / ${formatKRW(profile?.current_limit)}`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">요청 내역</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : requests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            아직 요청 내역이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <RequestSummaryCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
