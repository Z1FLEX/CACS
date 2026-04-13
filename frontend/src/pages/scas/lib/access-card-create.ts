import { z } from 'zod'
import type { AccessCard } from '@/types/scas'

export const accessCardStatusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Revoked', value: 'REVOKED' },
] as const

export const accessCardCreateSchema = z.object({
  cardNumber: z.string().min(1, 'Card UID is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REVOKED']).default('ACTIVE'),
})

export type AccessCardCreateValues = z.infer<typeof accessCardCreateSchema>

export const accessCardImportDescription =
  'Upload a CSV file to bulk import access cards. Supported columns are Card UID and Status, which match the normal card creation form.'

export const accessCardImportExampleData: AccessCardCreateValues[] = [
  { cardNumber: 'AC-0001', status: 'ACTIVE' },
  { cardNumber: 'AC-0002', status: 'INACTIVE' },
]

export function buildNewAccessCardDraft(values: AccessCardCreateValues): Partial<AccessCard> {
  const cardNumber = values.cardNumber.trim()

  return {
    cardNumber,
    uid: cardNumber,
    status: values.status,
  }
}
