import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

export type UserRole = 'ADMIN' | 'RESPONSABLE' | 'USER'

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>('ADMIN')

  useEffect(() => {
    const nextRole = user?.role?.toUpperCase()
    if (nextRole === 'ADMIN' || nextRole === 'RESPONSABLE' || nextRole === 'USER') {
      setRole(nextRole)
    }
  }, [user?.role])

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within RoleProvider')
  }
  return context
}
