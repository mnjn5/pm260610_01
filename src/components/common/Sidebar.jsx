import { NavLink } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'
import { useAuthContext } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

const NAV_ITEMS = {
  [ROLES.USER]: [{ to: '/mypage', label: '내 현황' }],
  [ROLES.LEADER]: [{ to: '/leader', label: '요청 관리' }],
}

export default function Sidebar() {
  const { profile, role } = useAuthContext()
  const navItems = NAV_ITEMS[role] ?? []

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <p className="text-base font-semibold text-gray-900">토큰풀 관리</p>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.unit_name} · {profile?.username}님
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <ProfileMenu />
      </div>
    </aside>
  )
}
