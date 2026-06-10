import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { createPost } from '../../hooks/usePosts'
import { usePost } from '../../hooks/usePost'
import Button from '../../components/common/Button'
import ErrorMessage from '../../components/common/ErrorMessage'
import Spinner from '../../components/common/Spinner'

export default function BoardWritePage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const { post, loading: postLoading, updatePost } = usePost(isEdit ? id : null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!post) return
    if (post.user_id !== user?.id) {
      navigate('/board', { replace: true })
      return
    }
    setTitle(post.title)
    setContent(post.content)
  }, [post, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError(null)

    let err
    if (isEdit) {
      ({ error: err } = await updatePost({ title: title.trim(), content: content.trim() }))
    } else {
      ({ error: err } = await createPost({ userId: user.id, title: title.trim(), content: content.trim() }))
    }

    setSubmitting(false)
    if (err) {
      setError(isEdit ? '수정에 실패했습니다.' : '작성에 실패했습니다.')
      return
    }
    navigate(isEdit ? `/board/posts/${id}` : '/board')
  }

  if (isEdit && postLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? '게시글 수정' : '게시글 작성'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">제목</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="h-11 w-full rounded-md border border-gray-200 px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">내용</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full resize-none rounded-md border border-gray-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <ErrorMessage error={error} />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/board/posts/${id}` : '/board')}
            disabled={submitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
          </Button>
        </div>
      </form>
    </div>
  )
}
