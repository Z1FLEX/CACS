import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import type { Door, Device, Zone } from '@/types/scas'
import { DeviceType, type DeviceCreateDTO } from '@/types/device'
import type { DoorCreateDTO } from '@/types/door'
import { subscribeDoors, getDoors, loadDoors, removeDoor, subscribeDevices, getDevices, loadDevices, removeDevice, addDoor, addDevice, subscribeZones, loadZones, getZones } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import AddDoorDialog from './components/add-door-dialog'
import AddDeviceDialog from './components/add-device-dialog'
import CSVImportDialog from '@/components/custom/csv-import-dialog'
import { IconPlus, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react'

const doorColumns: ColumnConfig[] = [
  { key: 'name', label: 'Door Name', visible: true },
  { key: 'zoneName', label: 'Zone', visible: true },
  { key: 'deviceName', label: 'Device', visible: true },
  { key: 'relayIndex', label: 'Relay', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

const deviceColumns: ColumnConfig[] = [
  { key: 'name', label: 'Device Name', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'zoneName', label: 'Zone', visible: true },
  { key: 'relayCount', label: 'Relays', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function DoorsDevicesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
  const [doors, setDoors] = useState<Door[]>(() => getDoors())
  const [devices, setDevices] = useState<Device[]>(() => getDevices())
  const [zones, setZones] = useState<Zone[]>(() => getZones())
  const [openDoor, setOpenDoor] = useState(false)
  const [openDevice, setOpenDevice] = useState(false)
  const [importDoorOpen, setImportDoorOpen] = useState(false)
  const [importDeviceOpen, setImportDeviceOpen] = useState(false)
  const [currentDoor, setCurrentDoor] = useState<any | null>(null)
  const [currentDevice, setCurrentDevice] = useState<any | null>(null)

  useEffect(() => {
    const u1 = subscribeDoors(setDoors)
    const u2 = subscribeDevices(setDevices)
    const u3 = subscribeZones(setZones)
    loadDoors().then(() => {})
    loadDevices().then(() => {})
    loadZones().then(() => {})
    return () => {
      u1(); u2(); u3()
    }
  }, [])

  const handleAddDoor = () => setOpenDoor(true)

  const handleEditDoor = (id: string) => {
    const d = doors.find(x => x.id === id)
    if (d) {
      setCurrentDoor(d)
      setOpenDoor(true)
    }
  }

  const handleDeleteDoor = async (id: string) => {
    if (confirm(`Delete door ${id}?`)) {
      await removeDoor(id)
    }
  }

  const handleAddDevice = () => setOpenDevice(true)

  const handleEditDevice = (id: string) => {
    const d = devices.find(x => x.id === id)
    if (d) {
      setCurrentDevice(d)
      setOpenDevice(true)
    }
  }

  const handleDeleteDevice = async (id: string) => {
    if (confirm(`Delete device ${id}?`)) {
      await removeDevice(id)
    }
  }

  const refreshDoorsAndDevices = async () => {
    await Promise.all([loadDoors(), loadDevices()])
  }

  const handleImportDoors = async (validRows: Record<string, any>[]): Promise<number> => {
    let importedCount = 0
    
    for (const row of validRows) {
      try {
        const newDoor: DoorCreateDTO = {
          name: row.name,
          zoneId: Number(row.zoneId),
          location: row.location || '',
        }

        await addDoor(newDoor)
        importedCount++
      } catch (error) {
        console.error('Failed to import door:', error)
      }
    }
    
    await loadDoors()
    return importedCount
  }

  const handleImportDevices = async (validRows: Record<string, any>[]): Promise<number> => {
    let importedCount = 0
    
    for (const row of validRows) {
      try {
        const rawType = String(row.type || 'READER').toUpperCase()
        const deviceType =
          rawType === 'CONTROLLER' ? DeviceType.CONTROLLER :
          rawType === 'LOCK' ? DeviceType.LOCK :
          DeviceType.READER

        const newDevice: DeviceCreateDTO = {
          type: deviceType,
          serialNumber: String(row.serialNumber || row.name || `SN-${Date.now()}`),
          modelName: String(row.modelName || row.name || 'Imported Device'),
          ip: row.ip ? String(row.ip) : undefined,
          port: row.port ? Number(row.port) : undefined,
          zoneId: Number(row.zoneId),
          relayCount: row.relayCount ? Number(row.relayCount) : 1,
        }
        
        await addDevice(newDevice)
        importedCount++
      } catch (error) {
        console.error('Failed to import device:', error)
      }
    }
    
    await loadDevices()
    return importedCount
  }

  const visibleDoorColumns = isAdmin
    ? doorColumns
    : doorColumns.filter((column) => column.key !== 'actions')
  const visibleDeviceColumns = isAdmin
    ? deviceColumns
    : deviceColumns.filter((column) => column.key !== 'actions')

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Doors & Devices</h2>
        <p className='text-muted-foreground'>Manage physical doors and access control devices</p>
      </div>

      <Tabs defaultValue='doors' className='w-full'>
        <TabsList>
          <TabsTrigger value='doors'>Doors</TabsTrigger>
          <TabsTrigger value='devices'>Devices</TabsTrigger>
        </TabsList>

        <TabsContent value='doors' className='space-y-4'>
          {isAdmin && (
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setImportDoorOpen(true)} variant='outline' className='gap-2'>
                <IconUpload size={16} />
                Import
              </Button>
              <Button onClick={handleAddDoor} className='gap-2'>
                <IconPlus size={16} />
                Add Door
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Doors</CardTitle>
            </CardHeader>
            <CardContent>
              <TableDataWrapper
                data={doors}
                columns={visibleDoorColumns}
                itemsPerPage={10}
                searchableFields={['name', 'zoneName']}
              >
                {({ data, visibleColumns }) => (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {visibleColumns.map(col => (
                            <TableHead key={col.key}>{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((door) => (
                          <TableRow key={door.id}>
                            {visibleColumns.map(col => (
                              <TableCell key={`${door.id}-${col.key}`}>
                                {col.key === 'name' && <span className='font-medium'>{door.name}</span>}
                                {col.key === 'actions' && (
                                  <div className='flex gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleEditDoor(door.id)}
                                    >
                                      <IconEdit size={16} />
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleDeleteDoor(door.id)}
                                    >
                                      <IconTrash size={16} />
                                    </Button>
                                  </div>
                                )}
                                {!['name', 'actions'].includes(col.key) && (
                                  <>
                                    {col.key === 'zoneName' && door.zoneName}
                                    {col.key === 'deviceName' && (door.deviceName || 'Unwired')}
                                    {col.key === 'relayIndex' && (door.relayIndex != null ? door.relayIndex : 'Not set')}
                                    {col.key === 'location' && door.location}
                                  </>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TableDataWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='devices' className='space-y-4'>
          {isAdmin && (
            <div className='flex justify-end gap-2'>
              <Button onClick={() => setImportDeviceOpen(true)} variant='outline' className='gap-2'>
                <IconUpload size={16} />
                Import
              </Button>
              <Button onClick={handleAddDevice} className='gap-2'>
                <IconPlus size={16} />
                Add Device
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <TableDataWrapper
                data={devices}
                columns={visibleDeviceColumns}
                itemsPerPage={10}
                searchableFields={['name', 'type', 'zoneName']}
              >
                {({ data, visibleColumns }) => (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {visibleColumns.map(col => (
                            <TableHead key={col.key}>{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((device) => (
                          <TableRow key={device.id}>
                            {visibleColumns.map(col => (
                              <TableCell key={`${device.id}-${col.key}`}>
                                {col.key === 'name' && (
                                  <span className='font-medium'>{device.name}</span>
                                )}
                                {col.key === 'actions' && (
                                  <div className='flex gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleEditDevice(device.id)}
                                    >
                                      <IconEdit size={16} />
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleDeleteDevice(device.id)}
                                    >
                                      <IconTrash size={16} />
                                    </Button>
                                  </div>
                                )}
                                {!['status', 'name', 'actions'].includes(col.key) && (
                                  <>
                                    {col.key === 'type' && device.type}
                                    {col.key === 'zoneName' && device.zoneName}
                                    {col.key === 'relayCount' && device.relayCount}
                                  </>
                                )}
                                {col.key === 'status' && <span>{device.status}</span>}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TableDataWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddDoorDialog
        open={isAdmin && openDoor}
        onOpenChange={(s) => { if (!s) setCurrentDoor(null); setOpenDoor(s) }}
        current={currentDoor}
        zones={zones}
        devices={devices}
        onSuccess={refreshDoorsAndDevices}
      />
      <AddDeviceDialog
        open={isAdmin && openDevice}
        onOpenChange={(s) => { if (!s) setCurrentDevice(null); setOpenDevice(s) }}
        current={currentDevice}
        zones={zones}
        onSuccess={refreshDoorsAndDevices}
      />

      {isAdmin && (
        <>
          <CSVImportDialog
            open={importDoorOpen}
            onOpenChange={setImportDoorOpen}
            title='Import Doors'
            description='Bulk import doors from a CSV file. Doors will be created with the provided information.'
            fields={[
              { key: 'name', label: 'Door Name', required: true, type: 'string' },
              { key: 'zoneId', label: 'Zone ID', required: true, type: 'string' },
              { key: 'location', label: 'Location', required: false, type: 'string' },
            ]}
            exampleData={[
              {
                name: 'Main Entrance',
                zoneId: 'zone1',
                location: 'Reception'
              },
              {
                name: 'Server Room Door',
                zoneId: 'zone2',
                location: 'Server Room'
              }
            ]}
            onImport={handleImportDoors}
            templateFileName='doors-template.csv'
          />

          <CSVImportDialog
            open={importDeviceOpen}
            onOpenChange={setImportDeviceOpen}
            title='Import Devices'
            description='Bulk import devices from a CSV file. Devices will be created in a selected zone with a defined relay capacity.'
            fields={[
              { key: 'name', label: 'Device Name', required: true, type: 'string' },
              { key: 'type', label: 'Device Type', required: false, type: 'enum', options: ['reader', 'controller', 'lock'] },
              { key: 'zoneId', label: 'Zone ID', required: true, type: 'string' },
              { key: 'relayCount', label: 'Relay Count', required: true, type: 'number' },
              { key: 'status', label: 'Status', required: false, type: 'enum', options: ['online', 'offline'] },
            ]}
            exampleData={[
              {
                name: 'Main Entrance Reader',
                zoneId: '1',
                type: 'reader',
                relayCount: 4,
                status: 'online'
              },
              {
                name: 'Server Room Lock',
                zoneId: '2',
                type: 'lock',
                relayCount: 2,
                status: 'online'
              }
            ]}
            onImport={handleImportDevices}
            templateFileName='devices-template.csv'
          />
        </>
      )}
    </div>
  )
}
