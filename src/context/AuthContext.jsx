import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { session, user, loading: authLoading, signIn, signOut } = useAuth()
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } =
    useProfile(user?.id)

  const value = {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    loading: authLoading || (!!user && profileLoading),
    profileError,
    signIn,
    signOut,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
