/**
 * Doors service – all door CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { Door } from '@/types/scas'
import type { DoorCreateDTO, DoorUpdateDTO } from '@/types/door'
import {
  getDoors as storeGetDoors,
  subscribeDoors as storeSubscribeDoors,
  doorsStore,
} from '@/data/scas-store'
import {
  apiGetDoors,
  apiCreateDoor,
  apiUpdateDoor,
  apiDeleteDoor,
} from '@/api/scas'

export type DoorSubscriber = (doors: Door[]) => void

function normalizeDoor(d: unknown): Door {
  const door = d as Record<string, unknown>;
  return { 
    ...door, 
    id: String(door.id), 
    zoneId: String(door.zoneId ?? ''),
    deviceId: door.deviceId != null ? String(door.deviceId) : undefined,
    deviceName: typeof door.deviceName === 'string' ? door.deviceName : '',
    relayIndex: typeof door.relayIndex === 'number' ? door.relayIndex : undefined,
    name: String(door.name ?? '')
  }
}

export async function loadDoors(): Promise<void> {
  const data = await apiGetDoors()
  doorsStore.replace(data.map(normalizeDoor))
}

export function getDoors(): Door[] {
  return storeGetDoors()
}

export function subscribeDoors(cb: DoorSubscriber): () => void {
  return storeSubscribeDoors(cb)
}

export async function addDoor(payload: DoorCreateDTO): Promise<void> {
  await apiCreateDoor(payload)
  await loadDoors()
}

export async function updateDoor(id: string, payload: DoorUpdateDTO): Promise<void> {
  await apiUpdateDoor(id, payload)
  await loadDoors()
}

export async function removeDoor(id: string): Promise<void> {
  await apiDeleteDoor(id)
  await loadDoors()
}
