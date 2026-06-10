import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-primary border-b-2 border-primary' : 'text-gray-800 hover:text-primary'
  }`

export default function Header() {
  const { user, profile, role, signOut } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-[200] border-b border-gray-200 bg-white shadow-nav">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-10">
        <Link to="/" className="text-lg font-bold text-gray-900">
          mycompany
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>홈</NavLink>
          <NavLink to="/products" className={navLinkClass}>제품소개</NavLink>
          <NavLink to="/board" className={navLinkClass}>게시판</NavLink>
          <NavLink to="/contact" className={navLinkClass}>문의하기</NavLink>
          {role === ROLES.ADMIN && (
            <NavLink to="/admin" className={navLinkClass}>관리자</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-700 sm:inline">
                {profile?.username ?? user.email}님
              </span>
              <Link to="/mypage" className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-primary">
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                로그인
              </Link>
              <Link to="/register" className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
