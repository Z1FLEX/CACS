/**
 * SCAS CRUD API – calls backend when VITE_API_BASE_URL is set.
 * Used by services to load/sync data and perform mutations.
 */
import { api } from '@/api/client'
import type { User, AccessCard, Zone, Door, Device, Profile, Schedule, AccessCardEnrollmentStatus } from '@/types/scas'
import type { DeviceCreateDTO, DeviceUpdateDTO } from '@/types/device'

const hasBase = () =>
  typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
  import.meta.env.VITE_API_BASE_URL.trim() !== ''

export function hasScasApi(): boolean {
  return hasBase()
}

function normalizeEntityId(id: unknown, entity: string): string {
  if (typeof id === 'string' || typeof id === 'number') {
    return String(id)
  }
  const type = id === null ? 'null' : Array.isArray(id) ? 'array' : typeof id
  throw new Error(`Invalid ${entity} ID: expected string or number, got ${type}`)
}

// Users
export async function apiGetUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/api/users')
  return Array.isArray(data) ? data : []
}

export async function apiCreateUser(payload: Partial<User>): Promise<User> {
  const { data } = await api.post<User>('/api/users', payload)
  return data
}

export async function apiUpdateUser(id: string, payload: Partial<User>): Promise<User> {
  const { data } = await api.put<User>(`/api/users/${id}`, payload)
  return data
}

export async function apiDeleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`)
}

// Access cards
export async function apiGetAccessCards(): Promise<AccessCard[]> {
  const { data } = await api.get<AccessCard[]>('/api/access-cards')
  return Array.isArray(data) ? data : []
}

export async function apiCreateAccessCard(payload: Partial<AccessCard>): Promise<AccessCard> {
  const { data } = await api.post<AccessCard>('/api/access-cards', payload)
  return data
}

export async function apiUpdateAccessCard(id: string, payload: Partial<AccessCard>): Promise<AccessCard> {
  const { data } = await api.put<AccessCard>(`/api/access-cards/${id}`, payload)
  return data
}

export async function apiDeleteAccessCard(id: string): Promise<void> {
  await api.delete(`/api/access-cards/${id}`)
}

export async function apiGetAccessCardEnrollmentStatus(): Promise<AccessCardEnrollmentStatus> {
  const { data } = await api.get<AccessCardEnrollmentStatus>('/api/access-cards/enrollment-mode')
  return data
}

export async function apiStartAccessCardEnrollment(): Promise<AccessCardEnrollmentStatus> {
  const { data } = await api.post<AccessCardEnrollmentStatus>('/api/access-cards/enrollment-mode')
  return data
}

export async function apiStopAccessCardEnrollment(): Promise<void> {
  await api.delete('/api/access-cards/enrollment-mode')
}

export async function apiImportAccessCards(file: File): Promise<{ importedCount: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ importedCount: number }>('/api/access-cards/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// Zones
export async function apiGetZones(): Promise<Zone[]> {
  const { data } = await api.get<Zone[]>('/api/zones')
  return Array.isArray(data) ? data : []
}

export async function apiCreateZone(payload: Partial<Zone>): Promise<Zone> {
  const { data } = await api.post<Zone>('/api/zones', payload)
  return data
}

export async function apiUpdateZone(id: string, payload: Partial<Zone>): Promise<Zone> {
  const { data } = await api.put<Zone>(`/api/zones/${id}`, payload)
  return data
}

export async function apiDeleteZone(id: string): Promise<void> {
  await api.delete(`/api/zones/${id}`)
}

// Doors
export async function apiGetDoors(): Promise<Door[]> {
  const { data } = await api.get<Door[]>('/api/doors')
  return Array.isArray(data) ? data : []
}

export async function apiCreateDoor(payload: Partial<Door>): Promise<Door> {
  const { data } = await api.post<Door>('/api/doors', payload)
  return data
}

export async function apiUpdateDoor(id: string, payload: Partial<Door>): Promise<Door> {
  const { data } = await api.put<Door>(`/api/doors/${id}`, payload)
  return data
}

export async function apiDeleteDoor(id: string): Promise<void> {
  await api.delete(`/api/doors/${id}`)
}

// Devices
export async function apiGetDevices(): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/api/devices')
  return Array.isArray(data) ? data : []
}

export async function apiCreateDevice(payload: DeviceCreateDTO): Promise<Device> {
  const { data } = await api.post<Device>('/api/devices', payload)
  return data
}

export async function apiUpdateDevice(id: string, payload: DeviceUpdateDTO): Promise<Device> {
  const deviceId = normalizeEntityId(id, 'device')
  const { data } = await api.put<Device>(`/api/devices/${deviceId}`, payload)
  return data
}

export async function apiDeleteDevice(id: string): Promise<void> {
  const deviceId = normalizeEntityId(id, 'device')
  await api.delete(`/api/devices/${deviceId}`)
}

// Profiles
export async function apiGetProfiles(): Promise<Profile[]> {
  const { data } = await api.get<Profile[]>('/api/profiles')
  return Array.isArray(data) ? data : []
}

export async function apiCreateProfile(payload: Partial<Profile>): Promise<Profile> {
  const { data } = await api.post<Profile>('/api/profiles', payload)
  return data
}

export async function apiUpdateProfile(id: string, payload: Partial<Profile>): Promise<Profile> {
  const { data } = await api.put<Profile>(`/api/profiles/${id}`, payload)
  return data
}

export async function apiDeleteProfile(id: string): Promise<void> {
  await api.delete(`/api/profiles/${id}`)
}

// Schedules
export async function apiGetSchedules(): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[]>('/api/schedules')
  return Array.isArray(data) ? data : []
}

export async function apiCreateSchedule(payload: Partial<Schedule>): Promise<Schedule> {
  const { data } = await api.post<Schedule>('/api/schedules', payload)
  return data
}

export async function apiUpdateSchedule(id: string, payload: Partial<Schedule>): Promise<Schedule> {
  const { data } = await api.put<Schedule>(`/api/schedules/${id}`, payload)
  return data
}

export async function apiDeleteSchedule(id: string): Promise<void> {
  await api.delete(`/api/schedules/${id}`)
}
