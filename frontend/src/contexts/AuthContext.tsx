import { createContext, useContext, useState, useEffect } from 'react'
import { login, logout as apiLogout, refreshToken } from '@/api/auth'
import { resolveEffectiveRole, type AppRole } from '@/lib/rbac'

interface User {
  id: number
  email: string
  role: AppRole
}

function extractRolesFromToken(token: string | null): string[] {
  if (!token) {
    return []
  }

  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return []
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
    const decodedPayload = JSON.parse(atob(paddedPayload)) as { roles?: unknown }

    if (!Array.isArray(decodedPayload.roles)) {
      return []
    }

    return decodedPayload.roles.filter((value): value is string => typeof value === 'string')
  } catch (error) {
    console.error('Failed to decode access token roles:', error)
    return []
  }
}

function normalizeUser(raw: unknown, tokenRoles: string[] = []): User | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const value = raw as {
    id?: unknown
    email?: unknown
    role?: unknown
    roles?: unknown
  }

  const id = typeof value.id === 'number' ? value.id : Number(value.id)
  const email = typeof value.email === 'string' ? value.email : ''
  const role = resolveEffectiveRole(value.role, [...tokenRoles, ...(Array.isArray(value.roles) ? value.roles : [])])

  if (!Number.isFinite(id) || !email || !role) {
    return null
  }

  return { id, email, role }
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  pendingUser: User | null
  setPendingUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await refreshToken()
        const tokenRoles = extractRolesFromToken(response.accessToken)
        setUser(normalizeUser(response.user, tokenRoles))
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await login({ email, password })
      const tokenRoles = extractRolesFromToken(response.accessToken)
      const normalizedUser = normalizeUser(response.user, tokenRoles)

      if (!normalizedUser) {
        throw new Error('Login response is missing a valid user role')
      }
      
      setUser(normalizedUser)
      
      // Set pending user for OTP if needed
      setPendingUser(normalizedUser)
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Call logout API to blacklist token
      await apiLogout()
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with local logout even if API call fails
    } finally {
      setUser(null)
      setPendingUser(null)
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      pendingUser, 
      setPendingUser, 
      login: handleLogin, 
      logout: handleLogout,
      isLoading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
