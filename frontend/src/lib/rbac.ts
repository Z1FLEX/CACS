export type AppRole = 'ADMIN' | 'RESPONSABLE' | 'USER'

const ROLE_PRIORITY: AppRole[] = ['ADMIN', 'RESPONSABLE', 'USER']

export function resolveEffectiveRole(role: unknown, roles: unknown): AppRole | null {
  const normalizedRoles = new Set<string>()

  if (typeof role === 'string' && role.trim()) {
    normalizedRoles.add(role.trim().toUpperCase())
  }

  if (Array.isArray(roles)) {
    for (const value of roles) {
      if (typeof value === 'string' && value.trim()) {
        normalizedRoles.add(value.trim().toUpperCase())
      }
    }
  }

  for (const candidate of ROLE_PRIORITY) {
    if (normalizedRoles.has(candidate)) {
      return candidate
    }
  }

  return null
}
