import { REQUEST_STATUS } from '../../utils/constants'

const STATUS_CONFIG = {
  [REQUEST_STATUS.PENDING]: { label: '대기중', className: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
  [REQUEST_STATUS.APPROVED]: { label: '승인됨', className: 'bg-green-50 text-green-700 ring-green-600/20' },
  [REQUEST_STATUS.REJECTED]: { label: '반려됨', className: 'bg-red-50 text-red-700 ring-red-600/20' },
}

export default function Badge({ status }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
