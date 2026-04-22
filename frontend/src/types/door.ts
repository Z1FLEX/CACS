export interface DoorCreateDTO {
  name: string
  zoneId: number
  location?: string
  deviceId?: number
  relayIndex?: number
}

export interface DoorUpdateDTO {
  name: string
  zoneId: number
  location?: string
  deviceId?: number
  relayIndex?: number
}
