/**
 * Access cards service – all card CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { AccessCard, AccessCardEnrollmentStatus } from '@/types/scas'
import {
  getAccessCards as storeGetCards,
  subscribeAccessCards as storeSubscribeCards,
  accessCardsStore,
} from '@/data/scas-store'
import {
  apiGetAccessCards,
  apiCreateAccessCard,
  apiUpdateAccessCard,
  apiDeleteAccessCard,
  apiGetAccessCardEnrollmentStatus,
  apiImportAccessCards,
  apiStartAccessCardEnrollment,
  apiStopAccessCardEnrollment,
} from '@/api/scas'

export type AccessCardSubscriber = (cards: AccessCard[]) => void

function normalizeCard(c: any): AccessCard {
  return {
    ...c,
    id: String(c.id),
    uuid: c.uuid ?? undefined,
    userId: c.userId != null ? String(c.userId) : undefined,
    status: (c.status || 'ACTIVE').toUpperCase(),
    createdAt:
      (typeof c.createdAt === 'string' && c.createdAt.trim() !== '' && c.createdAt) ||
      (typeof c.created_at === 'string' && c.created_at.trim() !== '' && c.created_at) ||
      undefined,
  }
}

export async function loadAccessCards(): Promise<void> {
  const data = await apiGetAccessCards()
  accessCardsStore.replace(data.map(normalizeCard))
}

/** Returns only non–soft-deleted cards. */
export function getAccessCards(): AccessCard[] {
  return storeGetCards().filter((c) => !c.deletedAt)
}

export function subscribeAccessCards(cb: AccessCardSubscriber): () => void {
  return storeSubscribeCards(cb)
}

function normalizeEnrollmentStatus(status: AccessCardEnrollmentStatus): AccessCardEnrollmentStatus {
  return {
    active: Boolean(status?.active),
    uid: status?.uid ?? null,
    expiresInSeconds:
      typeof status?.expiresInSeconds === 'number' ? status.expiresInSeconds : undefined,
    capturedAt: status?.capturedAt ?? null,
  }
}

function cardToCreateBody(rawUid: string): Record<string, unknown> {
  return {
    uid: rawUid,
    status: 'INACTIVE',
  }
}

export async function addAccessCard(rawUid: string): Promise<void> {
  await apiCreateAccessCard(cardToCreateBody(rawUid))
  await loadAccessCards()
}

export async function updateAccessCard(card: AccessCard): Promise<void> {
  await apiUpdateAccessCard(card.id, card)
  await loadAccessCards()
}

/** Soft delete: sets status to inactive and deletedAt. Card is hidden from list. */
export async function removeAccessCard(id: string): Promise<void> {
  await apiDeleteAccessCard(id)
  await loadAccessCards()
}

export async function startAccessCardEnrollment(): Promise<AccessCardEnrollmentStatus> {
  return normalizeEnrollmentStatus(await apiStartAccessCardEnrollment())
}

export async function getAccessCardEnrollmentStatus(): Promise<AccessCardEnrollmentStatus> {
  return normalizeEnrollmentStatus(await apiGetAccessCardEnrollmentStatus())
}

export async function stopAccessCardEnrollment(): Promise<void> {
  await apiStopAccessCardEnrollment()
}

export async function importAccessCards(file: File): Promise<number> {
  const result = await apiImportAccessCards(file)
  await loadAccessCards()
  return result.importedCount
}
