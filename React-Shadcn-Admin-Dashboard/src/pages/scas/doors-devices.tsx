import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import type { Door, Device } from '@/types/scas'
import { DeviceType, type DeviceCreateDTO } from '@/types/device'
import { subscribeDoors, getDoors, loadDoors, removeDoor, subscribeDevices, getDevices, loadDevices, removeDevice, addDoor, addDevice, subscribeZones, loadZones } from '@/services'
import AddDoorDialog from './components/add-door-dialog'
import AddDeviceDialog from './components/add-device-dialog'
import DeviceAssignmentDialog from './components/device-assignment-dialog'
import CSVImportDialog from '@/components/custom/csv-import-dialog'
import { IconPlus, IconEdit, IconTrash, IconUpload, IconLink } from '@tabler/icons-react'

const doorColumns: ColumnConfig[] = [
  { key: 'name', label: 'Door Name', visible: true },
  { key: 'zoneName', label: 'Zone', visible: true },
  { key: 'location', label: 'Location', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

const deviceColumns: ColumnConfig[] = [
  { key: 'name', label: 'Device Name', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'doorNames', label: 'Linked Doors', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function DoorsDevicesPage() {
  const [doors, setDoors] = useState<Door[]>(() => getDoors())
  const [devices, setDevices] = useState<Device[]>(() => getDevices())
  const [openDoor, setOpenDoor] = useState(false)
  const [openDevice, setOpenDevice] = useState(false)
  const [importDoorOpen, setImportDoorOpen] = useState(false)
  const [importDeviceOpen, setImportDeviceOpen] = useState(false)
  const [currentDoor, setCurrentDoor] = useState<any | null>(null)
  const [currentDevice, setCurrentDevice] = useState<any | null>(null)
  const [assignmentDevice, setAssignmentDevice] = useState<any | null>(null)
  const [openAssignment, setOpenAssignment] = useState(false)

  useEffect(() => {
    const u1 = subscribeDoors(setDoors)
    const u2 = subscribeDevices(setDevices)
    const u3 = subscribeZones(() => {})
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

  const handleAssignDoors = (device: any) => {
    setAssignmentDevice(device)
    setOpenAssignment(true)
  }

  const refreshDoorsAndDevices = async () => {
    await Promise.all([loadDoors(), loadDevices()])
  }

  const handleImportDoors = async (validRows: Record<string, any>[]): Promise<number> => {
    let importedCount = 0
    
    for (const row of validRows) {
      try {
        const newDoor: Door = {
          id: String(Date.now() + Math.random()),
          name: row.name,
          zoneId: row.zoneId || '',
          zoneName: row.zoneName || '',
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

        const parsedDoorIds = row.doorIds
          ? (Array.isArray(row.doorIds) ? row.doorIds : String(row.doorIds).split(','))
              .map((v: any) => Number(v))
              .filter((n: number) => Number.isFinite(n))
          : []

        const newDevice: DeviceCreateDTO = {
          type: deviceType,
          serialNumber: String(row.serialNumber || row.name || `SN-${Date.now()}`),
          modelName: String(row.modelName || row.name || 'Imported Device'),
          ip: row.ip ? String(row.ip) : undefined,
          port: row.port ? Number(row.port) : undefined,
          doorIds: parsedDoorIds,
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

          <Card>
            <CardHeader>
              <CardTitle>Doors</CardTitle>
            </CardHeader>
            <CardContent>
              <TableDataWrapper
                data={doors}
                columns={doorColumns}
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

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <TableDataWrapper
                data={devices}
                columns={deviceColumns}
                itemsPerPage={10}
                searchableFields={['name', 'type', 'doorNames']}
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
                                {col.key === 'status' && (
                                  <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                                    {device.status}
                                  </Badge>
                                )}
                                {col.key === 'name' && (
                                  <span className='font-medium cursor-pointer hover:text-blue-600' onClick={() => handleAssignDoors(device)}>
                                    {device.name}
                                  </span>
                                )}
                                {col.key === 'actions' && (
                                  <div className='flex gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleAssignDoors(device)}
                                      title='Assign doors'
                                    >
                                      <IconLink size={16} />
                                    </Button>
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
                                    {col.key === 'doorNames' && (
                                      <div className='space-y-1'>
                                        {device.doorNames && device.doorNames.length > 0 ? (
                                          device.doorNames.map((doorName: string, index: number) => (
                                            <span key={index} className='inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1'>
                                              {doorName}
                                            </span>
                                          ))
                                        ) : (
                                          <span className='text-gray-500'>No doors linked</span>
                                        )}
                                      </div>
                                    )}
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
      </Tabs>
      <AddDoorDialog
        open={openDoor}
        onOpenChange={(s) => { if (!s) setCurrentDoor(null); setOpenDoor(s) }}
        current={currentDoor}
        onSuccess={refreshDoorsAndDevices}
      />
      <AddDeviceDialog
        open={openDevice}
        onOpenChange={(s) => { if (!s) setCurrentDevice(null); setOpenDevice(s) }}
        current={currentDevice}
        onSuccess={refreshDoorsAndDevices}
      />
      <DeviceAssignmentDialog
        open={openAssignment}
        onOpenChange={(s) => { if (!s) setAssignmentDevice(null); setOpenAssignment(s) }}
        device={assignmentDevice}
        onSuccess={refreshDoorsAndDevices}
      />
      
      <CSVImportDialog
        open={importDoorOpen}
        onOpenChange={setImportDoorOpen}
        title='Import Doors'
        description='Bulk import doors from a CSV file. Doors will be created with the provided information.'
        fields={[
          { key: 'name', label: 'Door Name', required: true, type: 'string' },
          { key: 'zoneId', label: 'Zone ID', required: false, type: 'string' },
          { key: 'zoneName', label: 'Zone Name', required: false, type: 'string' },
          { key: 'location', label: 'Location', required: false, type: 'string' },
        ]}
        exampleData={[
          {
            name: 'Main Entrance',
            zoneId: 'zone1',
            zoneName: 'Reception',
            location: 'Building A - Floor 1'
          },
          {
            name: 'Server Room Door',
            zoneId: 'zone2',
            zoneName: 'Server Room',
            location: 'Building B - Basement'
          }
        ]}
        onImport={handleImportDoors}
        templateFileName='doors-template.csv'
      />
      
      <CSVImportDialog
        open={importDeviceOpen}
        onOpenChange={setImportDeviceOpen}
        title='Import Devices'
        description='Bulk import devices from a CSV file. Devices will be created with the provided information.'
        fields={[
          { key: 'name', label: 'Device Name', required: true, type: 'string' },
          { key: 'type', label: 'Device Type', required: false, type: 'enum', options: ['reader', 'controller', 'lock'] },
          { key: 'doorIds', label: 'Door IDs', required: false, type: 'string' },
          { key: 'doorNames', label: 'Door Names', required: false, type: 'string' },
          { key: 'status', label: 'Status', required: false, type: 'enum', options: ['online', 'offline'] },
        ]}
        exampleData={[
          {
            name: 'Main Entrance Reader',
            type: 'reader',
            doorIds: 'door1,door2',
            doorNames: 'Main Entrance,Side Entrance',
            status: 'online'
          },
          {
            name: 'Server Room Lock',
            type: 'lock',
            doorIds: 'door3',
            doorNames: 'Server Room Door',
            status: 'online'
          }
        ]}
        onImport={handleImportDevices}
        templateFileName='devices-template.csv'
      />
    </div>
  )
}
