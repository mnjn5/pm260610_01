function getUsageColorClass(percent) {
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 70) return 'bg-orange-400'
  return 'bg-green-500'
}

export default function UsageProgressBar({ used, limit, label }) {
  const percent = limit > 0 ? (used / limit) * 100 : 0
  const widthPercent = Math.min(Math.max(percent, 0), 100)

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${getUsageColorClass(percent)}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  )
}
