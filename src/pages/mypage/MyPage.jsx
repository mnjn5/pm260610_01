import { useEffect, useRef, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_MB = 5

export default function MyPage() {
  const { profile, loading, updateProfile, uploadAvatar, deleteAvatar } = useAuthContext()
  const fileInputRef = useRef(null)

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState(null)

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone ?? '')
      setAddress(profile.address ?? '')
    }
  }, [profile])

  const handleEdit = () => {
    setEditing(true)
    setSuccess(false)
    setError(null)
  }

  const handleCancel = () => {
    setPhone(profile?.phone ?? '')
    setAddress(profile?.address ?? '')
    setEditing(false)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const { error } = await updateProfile({ phone: phone || null, address: address || null })

    setSubmitting(false)
    if (error) {
      setError('정보 수정에 실패했습니다.')
      return
    }
    setEditing(false)
    setSuccess(true)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > MAX_MB * 1024 * 1024) {
      setAvatarError(`파일 크기는 ${MAX_MB}MB 이하여야 합니다.`)
      return
    }

    setAvatarLoading(true)
    setAvatarError(null)
    const { error } = await uploadAvatar(file)
    setAvatarLoading(false)
    if (error) setAvatarError('프로필 사진 업로드에 실패했습니다.')
  }

  const handleAvatarDelete = async () => {
    setAvatarLoading(true)
    setAvatarError(null)
    const { error } = await deleteAvatar()
    setAvatarLoading(false)
    if (error) setAvatarError('프로필 사진 삭제에 실패했습니다.')
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="mx-auto max-w-2xl py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">마이페이지</h1>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-semibold text-gray-800">내 정보</h2>

          {/* 프로필 사진 */}
          <div className="mb-7 flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              {avatarLoading ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Spinner />
                </div>
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="프로필 사진"
                  className="h-20 w-20 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400 select-none">
                  {profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                >
                  {profile?.avatar_url ? '사진 변경' : '사진 등록'}
                </Button>
                {profile?.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAvatarDelete}
                    disabled={avatarLoading}
                  >
                    삭제
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · 최대 {MAX_MB}MB</p>
              {avatarError && <p className="text-xs text-error">{avatarError}</p>}
            </div>
          </div>

          {/* 읽기 전용 정보 */}
          <dl className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 text-sm text-gray-500">사용자명</dt>
              <dd className="text-sm text-gray-900">{profile?.username}</dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 text-sm text-gray-500">이메일</dt>
              <dd className="text-sm text-gray-900">{profile?.email}</dd>
            </div>
          </dl>

          {/* 수정 가능 정보 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                placeholder="010-0000-0000"
                className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">주소</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!editing}
                className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <ErrorMessage error={error} />
            {success && (
              <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                정보가 수정되었습니다.
              </p>
            )}

            {editing ? (
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? '저장 중...' : '저장'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={submitting}>
                  취소
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" onClick={handleEdit}>
                수정
              </Button>
            )}
          </form>
        </div>
    </div>
  )
}
