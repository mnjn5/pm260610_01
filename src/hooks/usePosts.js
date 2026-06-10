import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const POSTS_PAGE_SIZE = 10

export function usePosts(page = 1) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const from = (page - 1) * POSTS_PAGE_SIZE
    const to = from + POSTS_PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('id, title, view_count, created_at, profiles(username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      setError(error)
    } else {
      setPosts(data)
      setTotal(count ?? 0)
      setError(null)
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, total, pageSize: POSTS_PAGE_SIZE, loading, error, refetch: fetchPosts }
}

export async function createPost({ userId, title, content }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, title, content })
    .select()
    .single()
  return { data, error }
}
