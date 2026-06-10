import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  const { profile, role, loading: profileLoading, refetch: refetchProfile, updateProfile, uploadAvatar, deleteAvatar } = useProfile(auth.user?.id)

  const value = {
    ...auth,
    profile,
    role,
    refetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    loading: auth.loading || (!!auth.user && profileLoading),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext는 AuthProvider 내부에서만 사용할 수 있습니다')
  }
  return context
}
