/**
 * Audit logs service – read-only. UI must use this instead of mock data directly.
 */
import type { AuditLog } from '@/types/scas'

// Store for audit logs (initialized empty, populated by API)
let auditLogs: AuditLog[] = []

export function getAuditLogs(): AuditLog[] {
  return auditLogs
}

export function setAuditLogs(logs: AuditLog[]): void {
  auditLogs = logs
}

// TODO: Add API integration when backend endpoints are available
// export async function loadAuditLogs(): Promise<void> {
//   const data = await apiGetAuditLogs()
//   setAuditLogs(data)
// }
