/**
 * JWT Authentication API functions
 */
import { api } from '@/api/client'
import { clearAccessToken, setAccessToken } from '@/api/auth-session'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: {
    id: number
    email: string
    role?: string
    roles?: string[]
  }
}

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  user: LoginResponse['user']
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', credentials)
  setAccessToken(data.accessToken)
  return data
}

export async function refreshToken(): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/api/auth/refresh', {})
  setAccessToken(data.accessToken)
  return data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout')
  } finally {
    clearAccessToken()
  }
}
