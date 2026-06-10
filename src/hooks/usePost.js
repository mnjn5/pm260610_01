import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePost(postId, { incrementView = false } = {}) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(Boolean(postId))
  const [error, setError] = useState(null)

  const fetchPost = useCallback(async () => {
    if (!postId) return
    setLoading(true)

    if (incrementView) {
      await supabase.rpc('increment_view_count', { post_id: Number(postId) })
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('id', postId)
      .single()

    if (error) {
      setError(error)
    } else {
      setPost(data)
      setError(null)
    }
    setLoading(false)
  }, [postId, incrementView])

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    fetchPost()
  }, [fetchPost, postId])

  const updatePost = async ({ title, content }) => {
    const { error } = await supabase
      .from('posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', postId)
    if (!error) await fetchPost()
    return { error }
  }

  const deletePost = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    return { error }
  }

  return { post, loading, error, updatePost, deletePost }
}
