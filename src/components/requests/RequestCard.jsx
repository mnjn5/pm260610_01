import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDateTime } from '../../utils/formatDate'
import { formatKRW } from '../../utils/formatKRW'

export default function RequestCard({ request, onApprove, onReject }) {
  const percent =
    request.current_limit > 0
      ? ((request.requested_limit - request.current_limit) / request.current_limit) * 100
      : 0
  const isActionable = !!(onApprove || onReject)

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {request.requester?.username} · {request.requester?.unit_name}
          </p>
          <p className="text-xs text-gray-500">{formatDateTime(request.created_at)}</p>
        </div>
        {!isActionable && <Badge status={request.status} />}
      </div>

      <p className="text-sm font-medium text-gray-900">
        {formatKRW(request.current_limit)} → {formatKRW(request.requested_limit)}{' '}
        <span className={percent >= 0 ? 'text-green-600' : 'text-red-600'}>
          ({percent >= 0 ? '+' : ''}
          {percent.toFixed(1)}%)
        </span>
      </p>

      <p className="line-clamp-2 text-sm text-gray-600">{request.reason}</p>

      {isActionable && (
        <div className="flex justify-end gap-2">
          <Button variant="danger" onClick={() => onReject(request)}>
            반려
          </Button>
          <Button variant="primary" onClick={() => onApprove(request)}>
            승인
          </Button>
        </div>
      )}
    </div>
  )
}
