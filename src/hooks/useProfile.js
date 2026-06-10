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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error?.code === 'PGRST116') {
      // profiles row 없음 — 트리거 추가 전 가입 사용자 대응
      const { data: authData } = await supabase.auth.getUser()
      const authUser = authData?.user
      if (authUser) {
        const username =
          authUser.user_metadata?.username ||
          authUser.email?.split('@')[0] ||
          'user'
        const { data: created } = await supabase
          .from('profiles')
          .insert({ id: userId, username, email: authUser.email })
          .select()
          .single()
        setProfile(created)
        setError(null)
      }
    } else if (error) {
      setError(error)
    } else {
      setProfile(data)
      setError(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    if (!error) await fetchProfile()
    return { error }
  }

  const uploadAvatar = async (file) => {
    const path = `${userId}/avatar`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    return updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` })
  }

  const deleteAvatar = async () => {
    const { error } = await supabase.storage.from('avatars').remove([`${userId}/avatar`])
    if (error) return { error }
    return updateProfile({ avatar_url: null })
  }

  return {
    profile,
    role: profile?.role ?? null,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  }
}
