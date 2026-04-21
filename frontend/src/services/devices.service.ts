/**
 * Devices service – all device CRUD and subscriptions. UI must use this instead of store/mock.
 */
// devices.service.ts

import type { Device } from '@/types/scas'
import type { DeviceCreateDTO, DeviceUpdateDTO } from '@/types/device'
import {
  getDevices as storeGetDevices,
  subscribeDevices as storeSubscribeDevices,
  devicesStore,
} from '@/data/scas-store'
import {
  apiGetDevices,
  apiCreateDevice,
  apiUpdateDevice,
  apiDeleteDevice,
} from '@/api/scas'

export type DeviceSubscriber = (devices: Device[]) => void

const VALID_TYPES = new Set(['READER', 'CONTROLLER', 'LOCK'])
const VALID_STATUSES = new Set(['ONLINE', 'OFFLINE'])

function normalizeDevice(d: unknown): Device {
  const raw = d as Record<string, unknown>

  const rawType = String(raw.type ?? '').toUpperCase()
  const rawStatus = String(raw.status ?? '').toUpperCase()

  return {
    ...raw,
    id:        String(raw.id),
    zoneId:    raw.zoneId != null ? String(raw.zoneId) : undefined,
    zoneName:  (raw.zoneName as string) || '',
    relayCount: typeof raw.relayCount === 'number' ? raw.relayCount : undefined,
    availableRelayIndices: Array.isArray(raw.availableRelayIndices)
      ? raw.availableRelayIndices.map((value) => String(value))
      : [],
    doorIds:   ((raw.doorIds as number[]) || []).map(String),
    doorNames: (raw.doorNames as string[]) || [],
    name:      (raw.name as string) ?? (raw.serialNumber as string) ?? '',
    type:      VALID_TYPES.has(rawType)   ? rawType   : 'READER',   // safe fallback + log
    status:    VALID_STATUSES.has(rawStatus) ? rawStatus : 'OFFLINE',
  } as Device
}

export async function loadDevices(): Promise<void> {
  const data = await apiGetDevices()
  devicesStore.replace(data.map(normalizeDevice))
}

export function getDevices(): Device[] {
  return storeGetDevices()
}

export function subscribeDevices(cb: DeviceSubscriber): () => void {
  return storeSubscribeDevices(cb)
}

// Accept the create shape — NOT the full Device type
export async function addDevice(payload: DeviceCreateDTO): Promise<void> {
  await apiCreateDevice(payload)
  await loadDevices()
}

// Accept id + update shape separately — matches apiUpdateDevice(id, dto) signature
export async function updateDevice(id: string, payload: DeviceUpdateDTO): Promise<void> {
  await apiUpdateDevice(id, payload)
  await loadDevices()
}

export async function removeDevice(id: string): Promise<void> {
  await apiDeleteDevice(id)
  await loadDevices()
}
