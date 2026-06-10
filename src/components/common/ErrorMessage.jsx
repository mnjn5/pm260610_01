export default function ErrorMessage({ error }) {
  if (!error) return null

  const message = typeof error === 'string' ? error : error.message ?? '알 수 없는 오류가 발생했습니다.'

  return (
    <p className="rounded-md border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
      {message}
    </p>
  )
}
