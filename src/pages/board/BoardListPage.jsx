import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { usePosts, POSTS_PAGE_SIZE } from '../../hooks/usePosts'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

export default function BoardListPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { posts, total, loading, error } = usePosts(page)

  const totalPages = Math.ceil(total / POSTS_PAGE_SIZE)

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
        {user && (
          <Button onClick={() => navigate('/board/posts/new')}>글쓰기</Button>
        )}
      </div>

      <ErrorMessage error={error} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="w-16 py-3 text-center font-medium">번호</th>
              <th className="py-3 pl-4 text-left font-medium">제목</th>
              <th className="w-28 py-3 text-center font-medium">작성자</th>
              <th className="w-28 py-3 text-center font-medium">작성일</th>
              <th className="w-16 py-3 text-center font-medium">조회</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post, i) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="py-3 text-center text-gray-400">
                    {total - (page - 1) * POSTS_PAGE_SIZE - i}
                  </td>
                  <td className="py-3 pl-4">
                    <Link
                      to={`/board/posts/${post.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {post.profiles?.username}
                  </td>
                  <td className="py-3 text-center text-gray-400">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="py-3 text-center text-gray-400">{post.view_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
                p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
