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

/** Matches DB seed order in V1__create_scas_tables.sql */
const ZONE_TYPE_NAME_TO_ID: Record<string, number> = {
  White: 1,
  Green: 2,
  Blue: 3,
  Orange: 4,
  Red: 5,
  Black: 6,
}

/** Inverse of seed ids — used when API sends zoneTypeId but omits nested zoneType (lazy/JSON) */
const ZONE_TYPE_BY_ID: Record<number, { name: string; level: number }> = {
  1: { name: 'White', level: 0 },
  2: { name: 'Green', level: 1 },
  3: { name: 'Blue', level: 2 },
  4: { name: 'Orange', level: 3 },
  5: { name: 'Red', level: 4 },
  6: { name: 'Black', level: 5 },
}

function toTitleZoneTypeName(name: string): string {
  const t = name.trim()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

/** Map UI / API color name to DB zone_type.id (seed order) */
export function zoneTypeNameToId(name: string): number | undefined {
  const cap = toTitleZoneTypeName(name)
  if (!cap) return undefined
  const id = ZONE_TYPE_NAME_TO_ID[cap]
  return id != null ? id : undefined
}

function pickZoneTypeIdRaw(z: any): string | number | null | undefined {
  const a = z.zoneTypeId ?? z.zone_type_id
  if (a === null || a === undefined || a === '') return undefined
  return a
}

function pickRawZoneType(z: any): unknown {
  return z.zoneType ?? z.zone_type
}

function normalizeZone(z: any): Zone {
  let zoneType: Zone['zoneType'] = undefined
  const raw = pickRawZoneType(z)

  if (typeof raw === 'string' && raw.trim() !== '') {
    const cap = toTitleZoneTypeName(raw)
    if (ZONE_TYPE_NAME_TO_ID[cap] != null) {
      zoneType = { name: cap, level: ZONE_TYPE_BY_ID[ZONE_TYPE_NAME_TO_ID[cap]].level }
    } else {
      zoneType = { name: cap, level: 0 }
    }
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    const nm = String(o.name ?? o.Name ?? '').trim()
    const byMapId = Number(o.id ?? o.ID)
    if (!Number.isNaN(byMapId) && ZONE_TYPE_BY_ID[byMapId]) {
      zoneType = ZONE_TYPE_BY_ID[byMapId]
    }
    if (nm) {
      const cap = toTitleZoneTypeName(nm)
      const known = ZONE_TYPE_NAME_TO_ID[cap] != null
      zoneType = {
        name: known ? cap : nm,
        level: known
          ? ZONE_TYPE_BY_ID[ZONE_TYPE_NAME_TO_ID[cap]].level
          : Number(o.level ?? o.securityLevel ?? o.Level ?? 0),
      }
    }
  }

  const idRaw = pickZoneTypeIdRaw(z)
  if (!zoneType && idRaw != null && String(idRaw).trim() !== '') {
    const id = Number(idRaw)
    if (!Number.isNaN(id) && ZONE_TYPE_BY_ID[id]) {
      zoneType = ZONE_TYPE_BY_ID[id]
    }
  }

  let zid: string | undefined
  if (idRaw != null && String(idRaw).trim() !== '') {
    const n = Number(idRaw)
    if (!Number.isNaN(n)) zid = String(n)
  }
  if (!zid && zoneType) {
    const mapped = ZONE_TYPE_NAME_TO_ID[toTitleZoneTypeName(zoneType.name)]
    if (mapped != null) zid = String(mapped)
  }

  const managerRaw = z.manager
  return {
    ...z,
    id: String(z.id),
    zoneTypeId: zid,
    zoneType,
    manager: managerRaw != null && String(managerRaw).trim() !== '' ? String(managerRaw) : undefined,
  }
}

/** Label + level for table / tooltips; uses zoneType first, then zoneTypeId */
export function zoneTypeForUi(zone: Zone): { name: string; level: number } | null {
  if (zone.zoneType && typeof zone.zoneType === 'object' && 'name' in zone.zoneType) {
    const n = String((zone.zoneType as { name?: string }).name ?? '').trim()
    if (n) {
      const cap = toTitleZoneTypeName(n)
      if (ZONE_TYPE_NAME_TO_ID[cap] != null) {
        return { name: cap, level: ZONE_TYPE_BY_ID[ZONE_TYPE_NAME_TO_ID[cap]].level }
      }
      return {
        name: n,
        level: Number((zone.zoneType as { level?: number }).level ?? 0),
      }
    }
  }
  if (zone.zoneTypeId != null && String(zone.zoneTypeId).trim() !== '') {
    const id = Number(zone.zoneTypeId)
    if (!Number.isNaN(id) && ZONE_TYPE_BY_ID[id]) return ZONE_TYPE_BY_ID[id]
  }
  return null
}

function resolveZoneTypeId(zone: Zone): number | undefined {
  if (zone.zoneTypeId != null && zone.zoneTypeId !== '') {
    const n = Number(zone.zoneTypeId)
    if (!Number.isNaN(n)) return n
  }
  const nm =
    zone.zoneType && typeof zone.zoneType === 'object' && 'name' in zone.zoneType
      ? String(zone.zoneType.name)
      : ''
  const cap = toTitleZoneTypeName(nm)
  if (cap && ZONE_TYPE_NAME_TO_ID[cap] != null) return ZONE_TYPE_NAME_TO_ID[cap]
  return undefined
}

/** Backend ZoneCreateDTO / ZoneUpdateDTO: name, location, zoneTypeId, responsibleUserId */
function zoneToApiBody(zone: Zone): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: zone.name,
    location: zone.location ?? '',
  }
  const zt = resolveZoneTypeId(zone)
  if (zt !== undefined) body.zoneTypeId = zt
  if (zone.responsibleUserId !== undefined && zone.responsibleUserId !== '') {
    const n = Number(zone.responsibleUserId)
    if (!Number.isNaN(n)) body.responsibleUserId = n
  }
  return body
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
  await apiCreateZone(zoneToApiBody(zone) as Partial<Zone>)
  await loadZones()
}

export async function updateZone(zone: Zone): Promise<void> {
  await apiUpdateZone(zone.id, zoneToApiBody(zone) as Partial<Zone>)
  await loadZones()
}

/** Soft delete: sets deletedAt (and status inactive if present). Zone is hidden from list. */
export async function removeZone(id: string): Promise<void> {
  await apiDeleteZone(id)
  await loadZones()
}
