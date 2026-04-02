/**
 * Doors service – all door CRUD and subscriptions. UI must use this instead of store/mock.
 */
import type { Door } from '@/types/scas'
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

export async function addDoor(door: Door): Promise<void> {
  await apiCreateDoor(door)
  await loadDoors()
}

export async function updateDoor(door: Door): Promise<void> {
  await apiUpdateDoor(door.id, door)
  await loadDoors()
}

export async function removeDoor(id: string): Promise<void> {
  await apiDeleteDoor(id)
  await loadDoors()
}
