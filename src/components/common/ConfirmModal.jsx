import Button from './Button'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = '확인',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            취소
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? '처리 중...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
