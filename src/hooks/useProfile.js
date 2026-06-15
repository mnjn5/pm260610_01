import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, email, role, unit_name, current_limit, used_amount')
      .eq('id', userId)
      .single()

    if (fetchError) {
      setError('프로필 정보를 불러오지 못했습니다.')
      setProfile(null)
    } else {
      setError(null)
      setProfile(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
