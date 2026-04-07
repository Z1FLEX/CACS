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

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
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
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${baseURL}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          
          const { accessToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
