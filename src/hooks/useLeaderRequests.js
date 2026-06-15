import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { REQUEST_STATUS } from '../utils/constants'

export function useLeaderRequests() {
  const { user } = useAuthContext()
  const [pendingRequests, setPendingRequests] = useState([])
  const [processedRequests, setProcessedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('token_limit_requests')
      .select(
        'id, requester_id, current_limit, requested_limit, reason, status, created_at, processed_at, requester:profiles!requester_id (username, unit_name)'
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('요청 목록을 불러오지 못했습니다.')
      setPendingRequests([])
      setProcessedRequests([])
    } else {
      setError(null)
      setPendingRequests(data.filter((request) => request.status === REQUEST_STATUS.PENDING))
      setProcessedRequests(data.filter((request) => request.status !== REQUEST_STATUS.PENDING))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const processRequest = async (requestId, action) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (!request) {
      return { error: '요청 정보를 찾을 수 없습니다.' }
    }

    const { error: updateError } = await supabase
      .from('token_limit_requests')
      .update({
        status: action,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      return { error: '요청 처리에 실패했습니다.' }
    }

    if (action === REQUEST_STATUS.APPROVED) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_limit: request.requested_limit })
        .eq('id', request.requester_id)

      if (profileError) {
        return { error: '한도 업데이트에 실패했습니다.' }
      }
    }

    await fetchRequests()
    return { error: null }
  }

  return {
    pendingRequests,
    processedRequests,
    loading,
    error,
    refetch: fetchRequests,
    processRequest,
  }
}
