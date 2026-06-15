export default function Spinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${className}`}
    />
  )
}
