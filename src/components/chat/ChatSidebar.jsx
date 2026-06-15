import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useLeaderRequests } from '../../hooks/useLeaderRequests'
import ProfileMenu from '../common/ProfileMenu'
import { DASHBOARD_ROLES } from '../../utils/constants'

const RECENT_ITEMS = [
  '팀장님 보고용 요약 정리',
  '신규 캠페인 카피 초안',
  '회의록 핵심 내용 추출',
  '경쟁사 비교 자료 조사',
]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
  }`

function AdminLink() {
  const { pendingRequests } = useLeaderRequests()

  return (
    <NavLink to="/leader" className={navLinkClass}>
      <span className="text-base">🛠️</span>
      <span className="flex-1">어드민페이지</span>
      {pendingRequests.length > 0 && (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          {pendingRequests.length}
        </span>
      )}
    </NavLink>
  )
}

export default function ChatSidebar() {
  const { profile, role } = useAuthContext()
  const [unitOpen, setUnitOpen] = useState(true)

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <p className="text-base font-semibold text-gray-900">토큰풀 관리</p>
        <div className="mt-3">
          <input
            type="text"
            placeholder="🔍 검색"
            readOnly
            className="w-full cursor-default rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">채팅</p>
          <NavLink to="/chat" end className={navLinkClass}>
            <span className="text-base">➕</span>
            <span>새 채팅</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setUnitOpen((prev) => !prev)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">👥</span>
            <span className="flex-1 text-left">유닛 채팅</span>
            <span className="text-xs text-gray-400">{unitOpen ? '▾' : '▸'}</span>
          </button>
          {unitOpen && profile?.unit_name && (
            <NavLink
              to={`/chat/unit/${encodeURIComponent(profile.unit_name)}`}
              className={({ isActive }) =>
                `ml-7 block rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {profile.unit_name}
            </NavLink>
          )}

          <NavLink to="/chat/personal" className={navLinkClass}>
            <span className="text-base">💬</span>
            <span>개인 채팅</span>
          </NavLink>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">최근 항목</p>
          {RECENT_ITEMS.map((item) => (
            <Link
              key={item}
              to="/chat"
              className="block truncate rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              {item}
            </Link>
          ))}
        </div>

        {DASHBOARD_ROLES.includes(role) && (
          <div className="space-y-1">
            <AdminLink />
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <ProfileMenu />
      </div>
    </aside>
  )
}
