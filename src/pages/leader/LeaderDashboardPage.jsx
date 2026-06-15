import { useState } from 'react'
import { useLeaderRequests } from '../../hooks/useLeaderRequests'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import ConfirmModal from '../../components/common/ConfirmModal'
import RequestCard from '../../components/requests/RequestCard'
import { REQUEST_STATUS } from '../../utils/constants'
import { formatKRW } from '../../utils/formatKRW'

const TABS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
}

export default function LeaderDashboardPage() {
  const { pendingRequests, processedRequests, loading, error, processRequest } = useLeaderRequests()
  const [activeTab, setActiveTab] = useState(TABS.PENDING)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState(null)

  const requests = activeTab === TABS.PENDING ? pendingRequests : processedRequests

  const openConfirm = (request, action) => {
    setActionError(null)
    setConfirmTarget({ request, action })
  }

  const handleConfirm = async () => {
    if (!confirmTarget) return

    setProcessing(true)
    const { error: processError } = await processRequest(confirmTarget.request.id, confirmTarget.action)
    setProcessing(false)

    if (processError) {
      setActionError(processError)
      return
    }
    setConfirmTarget(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-lg font-semibold text-gray-900">요청 관리</h1>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.PENDING)}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeTab === TABS.PENDING
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          대기 ({pendingRequests.length}건)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.PROCESSED)}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeTab === TABS.PROCESSED
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          처리 완료
        </button>
      </div>

      <ErrorMessage message={error || actionError} />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          {activeTab === TABS.PENDING ? '대기 중인 요청이 없습니다.' : '처리된 요청이 없습니다.'}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={
                activeTab === TABS.PENDING ? (r) => openConfirm(r, REQUEST_STATUS.APPROVED) : undefined
              }
              onReject={
                activeTab === TABS.PENDING ? (r) => openConfirm(r, REQUEST_STATUS.REJECTED) : undefined
              }
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmTarget}
        title={confirmTarget?.action === REQUEST_STATUS.APPROVED ? '요청을 승인하시겠습니까?' : '요청을 반려하시겠습니까?'}
        message={
          confirmTarget &&
          `${confirmTarget.request.requester?.username}님 · ${formatKRW(confirmTarget.request.current_limit)} → ${formatKRW(confirmTarget.request.requested_limit)}`
        }
        confirmLabel={confirmTarget?.action === REQUEST_STATUS.APPROVED ? '승인' : '반려'}
        confirmVariant={confirmTarget?.action === REQUEST_STATUS.APPROVED ? 'primary' : 'danger'}
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
