/**
 * Access logs service – read-only. UI must use this instead of mock data directly.
 */
import type { AccessLog } from '@/types/scas'

// Store for access logs (initialized empty, populated by API)
let accessLogs: AccessLog[] = []

export function getAccessLogs(): AccessLog[] {
  return accessLogs
}

export function setAccessLogs(logs: AccessLog[]): void {
  accessLogs = logs
}

// TODO: Add API integration when backend endpoints are available
// export async function loadAccessLogs(): Promise<void> {
//   const data = await apiGetAccessLogs()
//   setAccessLogs(data)
// }
