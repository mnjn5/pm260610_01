import Badge from '../common/Badge'
import { formatDate } from '../../utils/formatDate'
import { formatKRW } from '../../utils/formatKRW'

export default function RequestSummaryCard({ request }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">
          {formatKRW(request.current_limit)} → {formatKRW(request.requested_limit)}
        </p>
      </div>
      <Badge status={request.status} />
    </div>
  )
}
