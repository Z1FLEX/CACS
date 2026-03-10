/**
 * SCAS data contracts – aligned with ER/database concepts.
 * All entities include id; soft-delete and audit fields where applicable.
 */

// ---------------------------------------------------------------------------
// Role & ZoneType (reference entities)
// ---------------------------------------------------------------------------

export interface Role {
  id: string
  type: 'ADMIN' | 'RESPONSABLE' | 'USER'
}

export interface ZoneType {
  id: string
  name: string
  securityLevel: number
  /** Display level (e.g. 0–5); may match securityLevel */
  level?: number
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface User {
  id: string
  firstName?: string
  lastName?: string
  /** Display name (can be derived from firstName + lastName) */
  name: string
  registrationNumber?: string
  birthDate?: string
  gender?: number
  status: UserStatus
  address?: string
  email: string
  /** Not exposed in UI; for API alignment */
  password?: string
  createdAt: string
  deletedAt?: string | null
  role: 'ADMIN' | 'RESPONSABLE' | 'USER'
  cardId?: string | null
  photo?: string
  /** Resolved profile id if needed */
  profileId?: string | null
}

// ---------------------------------------------------------------------------
// AccessCard
// ---------------------------------------------------------------------------

export type AccessCardStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED'

export interface AccessCard {
  id: string
  /** Card UID (unique identifier) */
  uid?: string
  /** Alias for uid / display */
  cardNumber: string
  num?: string
  status: AccessCardStatus
  createdAt?: string
  deletedAt?: string | null
  userId?: string
  userName?: string
  issueDate?: string
  expiryDate?: string
}

// ---------------------------------------------------------------------------
// Zone
// ---------------------------------------------------------------------------

export type ZoneStatus = 'active' | 'inactive'

export interface Zone {
  id: string
  name: string
  location?: string
  description?: string
  doorsCount?: number
  status?: ZoneStatus
  createdAt?: string
  deletedAt?: string | null
  zoneTypeId?: string
  /** ZoneType or inline display shape { name, level } */
  zoneType?: ZoneType | { name: string; level: number }
  manager?: string
}

// ---------------------------------------------------------------------------
// Door
// ---------------------------------------------------------------------------

export interface Door {
  id: string
  name: string
  zoneId: string
  zoneName?: string
  status?: 'online' | 'offline'
  lastActivity?: string
  createdAt?: string
  deletedAt?: string | null
}

// ---------------------------------------------------------------------------
// Device
// ---------------------------------------------------------------------------

export type DeviceType = 'reader' | 'controller' | 'lock'
export type DeviceStatus = 'online' | 'offline'

export interface Device {
  id: string
  serialNum?: string
  modelName?: string
  name: string
  type: DeviceType
  status: DeviceStatus
  accessStatus?: number
  ip?: string
  port?: number
  lastSeenAt?: string
  lastHeartbeat?: string
  location?: string
  doorId: string
  doorName?: string
  createdAt?: string
  deletedAt?: string | null
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface Profile {
  id: string
  name: string
  description?: string
  permissions?: number
  createdAt?: string
  deletedAt?: string | null
}

// ---------------------------------------------------------------------------
// Schedule (rule-based model matching database schema)
// ---------------------------------------------------------------------------

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface TimeSlot {
  id: string
  startTime: string // HH:MM format
  endTime: string   // HH:MM format
}

export interface ScheduleDay {
  id: string
  dayOfWeek: DayOfWeek
  timeSlots: TimeSlot[]
}

export interface Schedule {
  id: string
  name: string
  scheduleDays: ScheduleDay[]
  zones?: string
  createdAt?: string
  deletedAt?: string | null
}

// ---------------------------------------------------------------------------
// AccessLog (not in ER image – defined for contracts)
// ---------------------------------------------------------------------------

export type AccessLogAction = 'ENTRY' | 'EXIT'
export type AccessLogStatus = 'success' | 'denied'

export interface AccessLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  cardId: string
  action: AccessLogAction
  doorId: string
  doorName: string
  status: AccessLogStatus
  reason?: string
  createdAt?: string
}

// ---------------------------------------------------------------------------
// AuditLog (admin audit trail)
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string
  timestamp: string
  admin: string
  action: string
  entity: string
  entityId: string
  changes: string
  createdAt?: string
}
