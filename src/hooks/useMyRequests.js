import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useMyRequests() {
  const { user, profile } = useAuthContext()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setRequests([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('token_limit_requests')
      .select('id, current_limit, requested_limit, reason, status, created_at, processed_at')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('요청 내역을 불러오지 못했습니다.')
      setRequests([])
    } else {
      setError(null)
      setRequests(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const submitRequest = async ({ requestedLimit, reason }) => {
    if (!user || !profile) {
      return { error: '사용자 정보를 불러오지 못했습니다.' }
    }

    const { error: insertError } = await supabase.from('token_limit_requests').insert({
      requester_id: user.id,
      current_limit: profile.current_limit,
      requested_limit: requestedLimit,
      reason,
    })

    if (insertError) {
      return { error: '요청 제출에 실패했습니다.' }
    }

    await fetchRequests()
    return { error: null }
  }

  return { requests, loading, error, refetch: fetchRequests, submitRequest }
}
