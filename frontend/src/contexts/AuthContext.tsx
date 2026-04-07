import { createContext, useContext, useState, useEffect } from 'react'
import { login, logout as apiLogout } from '@/api/auth'

interface User {
  id: number
  email: string
  role: string
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

  // Check for existing tokens on mount and validate them
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const savedUser = localStorage.getItem('user')

      if (accessToken && savedUser) {
        try {
          // Validate token by making a simple API call
          // If the token is invalid, the interceptor will handle refresh or logout
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Token validation failed:', error)
          // Clear invalid tokens
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await login({ email, password })
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // Set user
      setUser(response.user)
      
      // Set pending user for OTP if needed
      setPendingUser(response.user)
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
      // Clear local storage and state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
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
