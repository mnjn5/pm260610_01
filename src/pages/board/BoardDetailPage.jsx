import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { usePost } from '../../hooks/usePost'
import { useComments } from '../../hooks/useComments'
import { formatDateTime } from '../../utils/formatDate'
import { ROLES } from '../../utils/constants'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

export default function BoardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuthContext()
  const { post, loading, error, deletePost } = usePost(id, { incrementView: true })
  const { comments, loading: commentsLoading, addComment, deleteComment } = useComments(id)

  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)

  const isOwner = user && post && user.id === post.user_id
  const isAdmin = role === ROLES.ADMIN

  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    const { error } = await deletePost()
    if (error) { window.alert('삭제에 실패했습니다.'); return }
    navigate('/board', { replace: true })
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentSubmitting(true)
    setCommentError(null)
    const { error } = await addComment({ userId: user.id, content: commentText.trim() })
    setCommentSubmitting(false)
    if (error) { setCommentError('댓글 등록에 실패했습니다.'); return }
    setCommentText('')
  }

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return
    await deleteComment(commentId)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error || !post) return (
    <div className="py-20 text-center text-gray-400">
      게시글을 찾을 수 없습니다.{' '}
      <Link to="/board" className="text-primary hover:underline">목록으로</Link>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/board" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
        ← 목록으로
      </Link>

      {/* 게시글 본문 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="mb-3 text-xl font-bold text-gray-900">{post.title}</h1>
        <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="font-medium text-gray-600">{post.profiles?.username}</span>
          <span>{formatDateTime(post.created_at)}</span>
          <span>조회 {post.view_count}</span>
        </div>
        <hr className="mb-5 border-gray-100" />
        <div className="min-h-[120px] whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {post.content}
        </div>

        {(isOwner || isAdmin) && (
          <div className="mt-6 flex justify-end gap-2">
            {isOwner && (
              <Button variant="ghost" onClick={() => navigate(`/board/posts/${id}/edit`)}>
                수정
              </Button>
            )}
            <Button variant="ghost" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* 댓글 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          댓글 {comments.length}개
        </h2>

        {commentsLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {comments.length === 0 ? (
              <li className="py-6 text-center text-sm text-gray-400">첫 댓글을 작성해보세요.</li>
            ) : (
              comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <span className="mr-2 text-sm font-medium text-gray-800">
                      {c.profiles?.username}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                    <p className="mt-1 text-sm text-gray-700">{c.content}</p>
                  </div>
                  {user && (user.id === c.user_id || isAdmin) && (
                    <button
                      onClick={() => handleCommentDelete(c.id)}
                      className="shrink-0 text-xs text-gray-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        )}

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요."
              rows={3}
              className="w-full resize-none rounded-md border border-gray-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <ErrorMessage error={commentError} />
            <div className="flex justify-end">
              <Button type="submit" disabled={commentSubmitting || !commentText.trim()}>
                {commentSubmitting ? '등록 중...' : '댓글 등록'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-center text-sm text-gray-400">
            댓글을 작성하려면{' '}
            <Link to="/login" className="text-primary hover:underline">로그인</Link>
            이 필요합니다.
          </p>
        )}
      </div>
    </div>
  )
}
