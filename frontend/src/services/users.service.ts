/**
 * Users service – all user CRUD and subscriptions. UI must use this instead of store/mock.
 * When VITE_API_BASE_URL is set, mutations and load go to the backend and sync to the store.
 */
import type { User } from '@/types/scas'
import { resolveEffectiveRole } from '@/lib/rbac'
import {
  getUsers as storeGetUsers,
  subscribeUsers as storeSubscribeUsers,
  usersStore,
} from '@/data/scas-store'
import {
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiAssignUserProfiles,
  apiDeleteUser,
} from '@/api/scas'

export type UserSubscriber = (users: User[]) => void

/** Load users from API into store (no-op when not using API). Call once when using backend. */
function normalizeUser(u: any): User {
  const createdAt =
    (typeof u.createdAt === 'string' && u.createdAt.trim() !== '' && u.createdAt) ||
    (typeof u.created_at === 'string' && u.created_at.trim() !== '' && u.created_at) ||
    new Date().toISOString()

  return {
    ...u,
    id: String(u.id),
    cardId: u.cardId != null ? String(u.cardId) : undefined,
    profileIds: Array.isArray(u.profileIds)
      ? u.profileIds.map((p: unknown) => String(p))
      : undefined,
    status: (u.status || 'ACTIVE').toUpperCase(),
    role: resolveEffectiveRole(u.role, u.roles) || 'USER',
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
    createdAt,
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

function userToCreateBody(user: Partial<User>): Record<string, unknown> {
  const cardIdNum =
    user.cardId != null && user.cardId !== '' && !Number.isNaN(Number(user.cardId))
      ? Number(user.cardId)
      : undefined
  const profileIdsNum = Array.isArray(user.profileIds)
    ? user.profileIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    : []

  return {
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: user.role ? [user.role] : ['USER'],
    status: user.status,
    address: user.address,
    cardId: cardIdNum,
    profileIds: profileIdsNum.length > 0 ? profileIdsNum : undefined,
    photo: user.photo,
  }
}

export async function addUser(user: Partial<User>): Promise<void> {
  await apiCreateUser(userToCreateBody(user))
  await loadUsers()
}

/** Build JSON body for PUT /api/users — backend expects numeric cardId; 0 clears access_card_id */
function userToApiBody(user: User): Record<string, unknown> {
  const body: Record<string, unknown> = {
    ...user,
    roles: user.role ? [user.role] : ['USER'],
  }
  delete body.role
  if (body.cardId !== undefined && body.cardId !== null && body.cardId !== '') {
    const n = Number(body.cardId)
    if (!Number.isNaN(n)) body.cardId = n
  }
  if (Array.isArray(user.profileIds)) {
    const ids = user.profileIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
    body.profileIds = ids
  }
  return body
}

export async function updateUser(user: User): Promise<void> {
  await apiUpdateUser(user.id, userToApiBody(user) as Partial<User>)
  await loadUsers()
}

export async function assignUserProfiles(userId: string, profileIds: string[]): Promise<void> {
  const ids = profileIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id))

  await apiAssignUserProfiles(userId, ids)
  await loadUsers()
}

/** Soft delete: sets status to inactive and deletedAt. Row is hidden from list. */
export async function removeUser(id: string): Promise<void> {
  await apiDeleteUser(id)
  await loadUsers()
}
