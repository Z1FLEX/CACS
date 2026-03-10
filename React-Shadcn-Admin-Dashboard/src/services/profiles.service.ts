/**
 * Access profiles service – all profile CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { Profile } from '@/types/scas'
import {
  getProfiles as storeGetProfiles,
  subscribeProfiles as storeSubscribeProfiles,
  profilesStore,
} from '@/data/scas-store'
import {
  apiGetProfiles,
  apiCreateProfile,
  apiUpdateProfile,
  apiDeleteProfile,
} from '@/api/scas'

export type ProfileSubscriber = (profiles: Profile[]) => void

function normalizeProfile(p: any): Profile {
  return { ...p, id: String(p.id) }
}

export async function loadProfiles(): Promise<void> {
  const data = await apiGetProfiles()
  profilesStore.replace(data.map(normalizeProfile))
}

export function getProfiles(): Profile[] {
  return storeGetProfiles()
}

export function subscribeProfiles(cb: ProfileSubscriber): () => void {
  return storeSubscribeProfiles(cb)
}

export async function addProfile(profile: Profile): Promise<void> {
  await apiCreateProfile(profile)
  await loadProfiles()
}

export async function updateProfile(profile: Profile): Promise<void> {
  await apiUpdateProfile(profile.id, profile)
  await loadProfiles()
}

export async function removeProfile(id: string): Promise<void> {
  await apiDeleteProfile(id)
  await loadProfiles()
}
