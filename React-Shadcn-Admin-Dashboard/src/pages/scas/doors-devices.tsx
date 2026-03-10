import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import type { Door, Device } from '@/types/scas'
import { subscribeDoors, getDoors, loadDoors, removeDoor, subscribeDevices, getDevices, loadDevices, removeDevice } from '@/services'
import AddDoorDialog from './components/add-door-dialog'
import AddDeviceDialog from './components/add-device-dialog'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

const doorColumns: ColumnConfig[] = [
  { key: 'name', label: 'Door Name', visible: true },
  { key: 'zoneName', label: 'Zone', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'lastActivity', label: 'Last Activity', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

const deviceColumns: ColumnConfig[] = [
  { key: 'name', label: 'Device Name', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'doorName', label: 'Linked Door', visible: true },
  { key: 'location', label: 'Location', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'lastHeartbeat', label: 'Last Heartbeat', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function DoorsDevicesPage() {
  const [doors, setDoors] = useState<Door[]>(() => getDoors())
  const [devices, setDevices] = useState<Device[]>(() => getDevices())
  const [openDoor, setOpenDoor] = useState(false)
  const [openDevice, setOpenDevice] = useState(false)
    const [currentDoor, setCurrentDoor] = useState<any | null>(null)
    const [currentDevice, setCurrentDevice] = useState<any | null>(null)

  useEffect(() => {
    const u1 = subscribeDoors(setDoors)
    const u2 = subscribeDevices(setDevices)
    loadDoors().then(() => {})
    loadDevices().then(() => {})
    return () => {
      u1(); u2()
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
          <div className='flex justify-end'>
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
                                {col.key === 'status' && (
                                  <Badge variant={door.status === 'online' ? 'default' : 'destructive'}>
                                    {door.status}
                                  </Badge>
                                )}
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
                                {!['status', 'name', 'actions'].includes(col.key) && (
                                  <>
                                    {col.key === 'zoneName' && door.zoneName}
                                    {col.key === 'lastActivity' && door.lastActivity}
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
          <div className='flex justify-end'>
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
                searchableFields={['name', 'type', 'location', 'doorName']}
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
                                {col.key === 'name' && <span className='font-medium'>{device.name}</span>}
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
                                    {col.key === 'doorName' && <span className='font-medium'>{device.doorName}</span>}
                                    {col.key === 'location' && device.location}
                                    {col.key === 'lastHeartbeat' && device.lastHeartbeat}
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
      <AddDoorDialog open={openDoor} onOpenChange={(s) => { if (!s) setCurrentDoor(null); setOpenDoor(s) }} current={currentDoor} />
      <AddDeviceDialog open={openDevice} onOpenChange={(s) => { if (!s) setCurrentDevice(null); setOpenDevice(s) }} current={currentDevice} />
    </div>
  )
}
