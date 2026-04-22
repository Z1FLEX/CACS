/**
 * JWT Authentication API functions
 */
import { api } from '@/api/client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
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
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', credentials)
  return data
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/api/auth/refresh', { refreshToken })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}
