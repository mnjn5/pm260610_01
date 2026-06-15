import UsageProgressBar from '../common/UsageProgressBar'
import { formatKRW } from '../../utils/formatKRW'

export default function LimitPreview({ usedAmount, currentLimit, requestedLimit }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">현재</p>
        <UsageProgressBar used={usedAmount} limit={currentLimit} />
        <p className="mt-2 text-sm text-gray-500">
          {formatKRW(usedAmount)} / {formatKRW(currentLimit)}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">변경 후 예상</p>
        <UsageProgressBar used={usedAmount} limit={requestedLimit} />
        <p className="mt-2 text-sm text-gray-500">
          {formatKRW(usedAmount)} / {formatKRW(requestedLimit)}
        </p>
      </div>
    </div>
  )
}
