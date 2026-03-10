/**
 * Zones service – all zone CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { Zone } from '@/types/scas'
import {
  getZones as storeGetZones,
  subscribeZones as storeSubscribeZones,
  zonesStore,
} from '@/data/scas-store'
import {
  apiGetZones,
  apiCreateZone,
  apiUpdateZone,
  apiDeleteZone,
} from '@/api/scas'

export type ZoneSubscriber = (zones: Zone[]) => void

function normalizeZone(z: any): Zone {
  return { ...z, id: String(z.id), zoneTypeId: z.zoneTypeId != null ? String(z.zoneTypeId) : undefined }
}

export async function loadZones(): Promise<void> {
  const data = await apiGetZones()
  zonesStore.replace(data.map(normalizeZone))
}

/** Returns only non–soft-deleted zones. */
export function getZones(): Zone[] {
  return storeGetZones().filter((z) => !z.deletedAt)
}

export function subscribeZones(cb: ZoneSubscriber): () => void {
  return storeSubscribeZones(cb)
}

export async function addZone(zone: Zone): Promise<void> {
  await apiCreateZone(zone)
  await loadZones()
}

export async function updateZone(zone: Zone): Promise<void> {
  await apiUpdateZone(zone.id, zone)
  await loadZones()
}

/** Soft delete: sets deletedAt (and status inactive if present). Zone is hidden from list. */
export async function removeZone(id: string): Promise<void> {
  await apiDeleteZone(id)
  await loadZones()
}
