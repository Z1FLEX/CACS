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
  apiStartAccessCardEnrollment,
  apiStopAccessCardEnrollment,
} from '@/api/scas'

export type AccessCardSubscriber = (cards: AccessCard[]) => void

function normalizeCard(c: any): AccessCard {
  const issueDate =
    (typeof c.issueDate === 'string' && c.issueDate.trim() !== '' && c.issueDate) ||
    (typeof c.createdAt === 'string' && c.createdAt.trim() !== '' && c.createdAt) ||
    (typeof c.created_at === 'string' && c.created_at.trim() !== '' && c.created_at) ||
    new Date().toISOString()

  return {
    ...c,
    id: String(c.id),
    cardNumber: c.cardNumber ?? c.num ?? c.uid ?? '',
    userId: c.userId != null ? String(c.userId) : undefined,
    status: (c.status || 'ACTIVE').toUpperCase(),
    issueDate,
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

function cardToCreateBody(card: Partial<AccessCard>): Record<string, unknown> {
  return {
    uid: card.uid || card.cardNumber,
    num: card.cardNumber,
    status: card.status,
  }
}

export async function addAccessCard(card: Partial<AccessCard>): Promise<void> {
  await apiCreateAccessCard(cardToCreateBody(card))
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

/** Assign a card to a user */
export async function assignCardToUser(cardId: string, userId: string, userName: string): Promise<void> {
  const card = getAccessCards().find(c => c.id === cardId)
  if (!card) throw new Error('Card not found')
  
  await updateAccessCard({
    ...card,
    userId,
    userName,
  })
}

/** Unassign a card from a user */
export async function unassignCard(cardId: string): Promise<void> {
  const card = getAccessCards().find(c => c.id === cardId)
  if (!card) throw new Error('Card not found')
  
  await updateAccessCard({
    ...card,
    userId: undefined,
    userName: undefined,
  })
}
