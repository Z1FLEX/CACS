export enum DeviceType {
  READER = 'READER',
  CONTROLLER = 'CONTROLLER', 
  LOCK = 'LOCK'
}

export interface DeviceCreateDTO {
  type: DeviceType
  serialNumber: string
  modelName: string
  ip?: string
  port?: number
  zoneId: number
  relayCount: number
}

export interface DeviceUpdateDTO {
  type?: string
  serialNumber?: string
  modelName?: string
  status?: string
  ip?: string
  port?: number
  zoneId?: number
  relayCount?: number
  doorIds?: number[]
}
