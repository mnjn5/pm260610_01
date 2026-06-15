import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { DASHBOARD_ROLES, ROLES } from '../../utils/constants'

export default function ProfileMenu() {
  const { profile, role, signOut } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const isChatContext = location.pathname.startsWith('/chat')
  const dashboardPath = DASHBOARD_ROLES.includes(role) ? '/leader' : '/mypage'

  const goTo = (path) => {
    setOpen(false)
    navigate(path)
  }

  const showPlaceholder = (label) => {
    setOpen(false)
    alert(`${label} 기능은 준비 중입니다.`)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-gray-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
          {profile?.username?.slice(0, 1) ?? '?'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900">{profile?.username}</span>
          <span className="block truncate text-xs text-gray-500">
            {role === ROLES.LEADER ? 'Leader' : 'Member'}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-10 mb-1 w-full min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => goTo('/mypage')}
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            마이페이지
          </button>
          <button
            type="button"
            onClick={() => showPlaceholder('알림')}
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            알림
          </button>
          <button
            type="button"
            onClick={() => showPlaceholder('지원팀 연락')}
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            지원팀 연락
          </button>
          {isChatContext ? (
            <button
              type="button"
              onClick={() => goTo(dashboardPath)}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              대시보드로 이동
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo('/chat')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              채팅허브로 이동
            </button>
          )}
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
