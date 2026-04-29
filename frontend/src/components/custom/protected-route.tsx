import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loader from '@/components/loader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to='/sign-in' replace />
  }

  return <>{children}</>
}
