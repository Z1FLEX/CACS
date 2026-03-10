import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import { EmptyState } from '@/components/custom/empty-state'
import type { Zone } from '@/types/scas'
import { subscribeZones, getZones, loadZones, removeZone } from '@/services'
import AddZoneDialog from './components/add-zone-dialog'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

const zoneTypeColorMap: Record<string, string> = {
  'White': 'bg-gray-100 text-gray-800 border-gray-300',
  'Green': 'bg-green-100 text-green-800 border-green-300',
  'Blue': 'bg-blue-100 text-blue-800 border-blue-300',
  'Orange': 'bg-orange-100 text-orange-800 border-orange-300',
  'Red': 'bg-red-100 text-red-800 border-red-300',
  'Black': 'bg-gray-900 text-gray-50 border-gray-900',
}

const zoneColumns: ColumnConfig[] = [
  { key: 'name', label: 'Zone Name', visible: true },
  { key: 'description', label: 'Description', visible: true },
  { key: 'zoneType', label: 'Zone Type', visible: true },
  { key: 'doorsCount', label: 'Doors Count', visible: true },
  { key: 'manager', label: 'Manager', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>(() => getZones())
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const unsub = subscribeZones(setZones)
    loadZones().then(() => {})
    return unsub
  }, [])

  const handleAddZone = () => setOpen(true)

  const handleEditZone = (id: string) => {
    const z = zones.find(x => x.id === id)
    if (z) {
      setCurrent(z)
      setOpen(true)
    }
  }

  const handleDeleteZone = (id: string) => {
    const z = zones.find(x => x.id === id)
    if (z) setDeleteTarget({ id: z.id, name: z.name })
  }

  const confirmDeleteZone = async () => {
    if (deleteTarget) {
      await removeZone(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Zones Management</h2>
          <p className='text-muted-foreground'>Manage access zones and their properties</p>
        </div>
        <Button onClick={handleAddZone} className='gap-2'>
          <IconPlus size={16} />
          Create Zone
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <EmptyState
              title="No zones yet"
              description="Create zones to organize doors and control access by area. Zones can have types and managers."
            />
          ) : (
          <TableDataWrapper
            data={zones}
            columns={zoneColumns}
            itemsPerPage={10}
            searchableFields={['name', 'description', 'manager']}
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
                    {data.map((zone) => (
                      <TableRow key={zone.id}>
                        {visibleColumns.map(col => (
                          <TableCell key={`${zone.id}-${col.key}`}>
                            {col.key === 'status' && (
                              <Badge variant={(zone as any).status === 'active' || (zone as any).status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {zone.status}
                              </Badge>
                            )}
                            {col.key === 'zoneType' && zone.zoneType && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant='outline'
                                      className={`capitalize ${zoneTypeColorMap[zone.zoneType.name] || ''}`}
                                    >
                                      {zone.zoneType.name}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Security Level: {zone.zoneType.level}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {col.key === 'name' && <span className='font-medium'>{zone.name}</span>}
                            {col.key === 'manager' && (zone.manager || '-')}
                            {col.key === 'actions' && (
                              <div className='flex gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEditZone(zone.id)}
                                >
                                  <IconEdit size={16} />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteZone(zone.id)}
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </div>
                            )}
                            {!['status', 'zoneType', 'name', 'manager', 'actions'].includes(col.key) && (
                              <>
                                {col.key === 'description' && zone.description}
                                {col.key === 'doorsCount' && zone.doorsCount}
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
          )}
        <AddZoneDialog open={open} onOpenChange={(s) => { if (!s) setCurrent(null); setOpen(s) }} current={current} />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete zone</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the zone &quot;{deleteTarget?.name}&quot; from the system.
              Doors and devices in this zone may need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteZone} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete zone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
