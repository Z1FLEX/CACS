/**
 * API client for backend CRUD. Use this in services when you switch from store to API.
 * Set VITE_API_BASE_URL in .env to point to your backend host (e.g. http://localhost:8080).
 */
import axios from 'axios'

const baseURL = (
  typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL.trim() !== ''
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '')
    : ''
).replace(/\/api$/, '')
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let refreshPromise: Promise<string | null> | null = null

function isAuthRoute(url?: string): boolean {
  return typeof url === 'string' && /\/api\/auth\/(login|refresh|logout)$/.test(url)
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')
    return JSON.parse(atob(normalized))
  } catch {
    return null
  }
}

function isTokenExpiringSoon(token: string, bufferSeconds = 30): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return payload.exp <= Math.floor(Date.now() / 1000) + bufferSeconds
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return null

      const response = await axios.post(
        `${baseURL}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const { accessToken } = response.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        return accessToken
      }

      return null
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/sign-in'
}

// Add JWT token to requests
api.interceptors.request.use(async (config) => {
  if (isAuthRoute(config.url)) {
    return config
  }

  let token = localStorage.getItem('accessToken')
  if (token && isTokenExpiringSoon(token)) {
    try {
      token = await refreshAccessToken()
    } catch {
      clearAuthAndRedirect()
      return Promise.reject(new axios.Cancel('Authentication refresh failed'))
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh and 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const accessToken = await refreshAccessToken()
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
