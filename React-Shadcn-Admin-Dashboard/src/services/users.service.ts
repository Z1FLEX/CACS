/**
 * Users service – all user CRUD and subscriptions. UI must use this instead of store/mock.
 * When VITE_API_BASE_URL is set, mutations and load go to the backend and sync to the store.
 */
import type { User } from '@/types/scas'
import {
  getUsers as storeGetUsers,
  subscribeUsers as storeSubscribeUsers,
  usersStore,
} from '@/data/scas-store'
import {
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
} from '@/api/scas'

export type UserSubscriber = (users: User[]) => void

/** Load users from API into store (no-op when not using API). Call once when using backend. */
function normalizeUser(u: any): User {
  return {
    ...u,
    id: String(u.id),
    cardId: u.cardId != null ? String(u.cardId) : undefined,
    profileId: u.profileId != null ? String(u.profileId) : undefined,
    status: (u.status || 'ACTIVE').toUpperCase(),
    role: (u.role || 'USER').toUpperCase(),
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
  }
}

export async function loadUsers(): Promise<void> {
  const data = await apiGetUsers()
  usersStore.replace(data.map(normalizeUser))
}

/** Returns only non–soft-deleted users. */
export function getUsers(): User[] {
  return storeGetUsers().filter((u) => !u.deletedAt)
}

export function subscribeUsers(cb: UserSubscriber): () => void {
  return storeSubscribeUsers(cb)
}

export async function addUser(user: User): Promise<void> {
  await apiCreateUser(user)
  await loadUsers()
}

export async function updateUser(user: User): Promise<void> {
  await apiUpdateUser(user.id, user)
  await loadUsers()
}

/** Soft delete: sets status to inactive and deletedAt. Row is hidden from list. */
export async function removeUser(id: string): Promise<void> {
  await apiDeleteUser(id)
  await loadUsers()
}
