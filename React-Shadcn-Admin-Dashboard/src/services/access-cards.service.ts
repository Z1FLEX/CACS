/**
 * Access cards service – all card CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { AccessCard } from '@/types/scas'
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
} from '@/api/scas'

export type AccessCardSubscriber = (cards: AccessCard[]) => void

function normalizeCard(c: any): AccessCard {
  return {
    ...c,
    id: String(c.id),
    cardNumber: c.cardNumber ?? c.uid ?? '',
    userId: c.userId != null ? String(c.userId) : undefined,
    status: (c.status || 'ACTIVE').toUpperCase(),
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

export async function addAccessCard(card: AccessCard): Promise<void> {
  await apiCreateAccessCard(card)
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
