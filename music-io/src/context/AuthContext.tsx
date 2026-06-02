import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser } from '../services/authApi'

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, accessToken: string) => void
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const USER_KEY = 'auth_user'
// TODO: accessToken 은 XSS 노출 위험으로 메모리 전용으로 옮길 예정.
//       quiz/question 모듈이 직접 localStorage 를 읽고 있어 마이그레이션 전까지 키 호환 유지.
const TOKEN_KEY = 'accessToken'

function isValidAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.nickname === 'string' &&
    typeof v.profileImg === 'string'
  )
}

function loadStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(USER_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (!isValidAuthUser(parsed)) {
      localStorage.removeItem(USER_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(loadStoredUser)
  const [accessToken, setAccessTokenState] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )

  function setUser(user: AuthUser | null) {
    setUserState(user)
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  function setAuth(nextUser: AuthUser, token: string) {
    setUserState(nextUser)
    setAccessTokenState(token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    localStorage.setItem(TOKEN_KEY, token)
  }

  function logout() {
    setUserState(null)
    setAccessTokenState(null)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
