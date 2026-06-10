import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(Boolean(postId))
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    if (!postId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error)
    } else {
      setComments(data)
      setError(null)
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    fetchComments()
  }, [fetchComments, postId])

  const addComment = async ({ userId, content }) => {
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content })
    if (!error) await fetchComments()
    return { error }
  }

  const deleteComment = async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) await fetchComments()
    return { error }
  }

  return { comments, loading, error, addComment, deleteComment }
}
