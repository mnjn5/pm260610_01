import { Link } from 'react-router-dom'
import Button from '../common/Button'
import UsageProgressBar from '../common/UsageProgressBar'
import { formatKRW } from '../../utils/formatKRW'

export default function AddUsageRequestCard({ profile, isUnitManager, unitUsage, unitName }) {
  const title = isUnitManager ? '유닛 사용량' : '내 사용량'
  const actionLabel = isUnitManager ? '유닛 관리' : '추가 요청'
  const actionHref = isUnitManager
    ? `/chat/unit/${encodeURIComponent(unitName ?? '')}/manage`
    : '/mypage/request'

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <Link to={actionHref}>
          <Button className="text-xs">{actionLabel}</Button>
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {isUnitManager && unitUsage && (
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">유닛 전체 사용량</p>
            <UsageProgressBar
              used={unitUsage.used}
              limit={unitUsage.limit}
              label={`${formatKRW(unitUsage.used)} / ${formatKRW(unitUsage.limit)}`}
            />
          </div>
        )}

        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">내 사용량</p>
          <UsageProgressBar
            used={profile?.used_amount ?? 0}
            limit={profile?.current_limit ?? 0}
            label={`${formatKRW(profile?.used_amount)} / ${formatKRW(profile?.current_limit)}`}
          />
        </div>
      </div>
    </div>
  )
}
