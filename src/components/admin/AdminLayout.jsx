import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-100'
  }`

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <aside className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>대시보드</NavLink>
        <NavLink to="/admin/users" className={linkClass}>회원 관리</NavLink>
        <NavLink to="/admin/posts" className={linkClass}>게시글 관리</NavLink>
        <NavLink to="/admin/products" className={linkClass}>제품 관리</NavLink>
        <NavLink to="/admin/inquiries" className={linkClass}>문의 관리</NavLink>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
