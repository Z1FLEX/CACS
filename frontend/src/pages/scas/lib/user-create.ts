import { z } from 'zod'
import type { User } from '@/types/scas'

export const userRoleOptions = [
  { label: 'User', value: 'USER' },
  { label: 'Responsable', value: 'RESPONSABLE' },
  { label: 'Admin', value: 'ADMIN' },
] as const

export const userStatusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
] as const

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['USER', 'RESPONSABLE', 'ADMIN']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type UserCreateValues = z.infer<typeof userCreateSchema>

export const userImportFields = [
  { key: 'name', label: 'Full Name', required: true, type: 'string' as const },
  { key: 'email', label: 'Email', required: true, type: 'email' as const },
  {
    key: 'role',
    label: 'Role',
    required: false,
    type: 'enum' as const,
    options: userRoleOptions.map((option) => option.value),
  },
  {
    key: 'status',
    label: 'Status',
    required: false,
    type: 'enum' as const,
    options: userStatusOptions.map((option) => option.value),
  },
] as const

export const userImportExampleData: UserCreateValues[] = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'USER',
    status: 'ACTIVE',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'RESPONSABLE',
    status: 'ACTIVE',
  },
]

export function buildNewUserDraft(values: UserCreateValues): Partial<User> {
  const name = values.name.trim()
  const parts = name.split(/\s+/).filter(Boolean)

  return {
    name,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || undefined,
    email: values.email.trim(),
    role: values.role,
    status: values.status,
  }
}
