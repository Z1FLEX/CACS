/**
 * Schedules service. UI must use this instead of mock data directly.
 */
import type { Schedule } from '@/types/scas'
import {
  getSchedules as storeGetSchedules,
  subscribeSchedules as storeSubscribeSchedules,
  schedulesStore,
} from '@/data/scas-store'
import {
  apiGetSchedules,
  apiCreateSchedule,
  apiUpdateSchedule,
  apiDeleteSchedule,
} from '@/api/scas'

export type ScheduleSubscriber = (schedules: Schedule[]) => void

function normalizeSchedule(s: any): Schedule {
  return {
    ...s,
    id: String(s.id),
    scheduleDays: s.scheduleDays || [],
  }
}

export async function loadSchedules(): Promise<void> {
  const data = await apiGetSchedules()
  schedulesStore.replace(data.map(normalizeSchedule))
}

export function getSchedules(): Schedule[] {
  return storeGetSchedules()
}

export function subscribeSchedules(cb: ScheduleSubscriber): () => void {
  return storeSubscribeSchedules(cb)
}

export async function addSchedule(schedule: Schedule): Promise<void> {
  await apiCreateSchedule(schedule)
  await loadSchedules()
}

export async function updateSchedule(schedule: Schedule): Promise<void> {
  await apiUpdateSchedule(schedule.id, schedule)
  await loadSchedules()
}

export async function removeSchedule(id: string): Promise<void> {
  await apiDeleteSchedule(id)
  await loadSchedules()
}
