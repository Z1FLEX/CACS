/**
 * Devices service – all device CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { Device } from '@/types/scas'
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

function normalizeDevice(d: any): Device {
  return {
    ...d,
    id: String(d.id),
    doorIds: (d.doorIds || []).map(String),
    doorNames: d.doorNames || [],
    name: d.name ?? d.serialNumber ?? '',
    status: (d.status || 'ONLINE').toUpperCase(),
  }
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

export async function addDevice(device: Device): Promise<void> {
  await apiCreateDevice(device)
  await loadDevices()
}

export async function updateDevice(device: Device): Promise<void> {
  await apiUpdateDevice(device.id, device)
  await loadDevices()
}

export async function removeDevice(id: string): Promise<void> {
  await apiDeleteDevice(id)
  await loadDevices()
}
