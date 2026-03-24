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
import { subscribeZones, getZones, loadZones, removeZone, addZone } from '@/services'
import AddZoneDialog from './components/add-zone-dialog'
import AssignZoneManagerDialog from './components/assign-zone-manager-dialog'
import CSVImportDialog from '@/components/custom/csv-import-dialog'
import { IconPlus, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react'

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
  { key: 'location', label: 'Location', visible: true },
  { key: 'zoneType', label: 'Zone Type', visible: true },
  { key: 'manager', label: 'Manager', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>(() => getZones())
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [current, setCurrent] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [managerDialogOpen, setManagerDialogOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

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

  const handleAssignManager = (zone: Zone) => {
    setSelectedZone(zone)
    setManagerDialogOpen(true)
  }

  const confirmDeleteZone = async () => {
    if (deleteTarget) {
      await removeZone(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleImportZones = async (validRows: Record<string, any>[]): Promise<number> => {
    let importedCount = 0
    
    for (const row of validRows) {
      try {
        const newZone: Zone = {
          id: String(Date.now() + Math.random()),
          name: row.name,
          location: row.location || '',
          description: row.description || '',
          zoneTypeId: row.zoneTypeId || '',
          zoneType: row.zoneType ? { name: row.zoneType, level: parseInt(row.level) || 0 } : undefined,
          manager: row.manager || '',
          status: row.status || 'active',
          createdAt: new Date().toISOString().split('T')[0],
        }
        
        await addZone(newZone)
        importedCount++
      } catch (error) {
        console.error('Failed to import zone:', error)
      }
    }
    
    await loadZones()
    return importedCount
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Zones Management</h2>
          <p className='text-muted-foreground'>Manage access zones and their properties</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setImportOpen(true)} variant='outline' className='gap-2'>
            <IconUpload size={16} />
            Import
          </Button>
          <Button onClick={handleAddZone} className='gap-2'>
            <IconPlus size={16} />
            Create Zone
          </Button>
        </div>
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
                            {col.key === 'zoneType' && zone.zoneType && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant='outline'
                                      className={`capitalize ${
                                        zoneTypeColorMap[
                                          typeof zone.zoneType === 'object' 
                                            ? zone.zoneType.name 
                                            : zone.zoneType
                                        ] || 'bg-gray-100 text-gray-800 border-gray-300'
                                      }`}
                                    >
                                      {typeof zone.zoneType === 'object' 
                                        ? zone.zoneType.name 
                                        : zone.zoneType
                                      }
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Security Level: {
                                      typeof zone.zoneType === 'object' 
                                        ? zone.zoneType.level 
                                        : 'N/A'
                                    }</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {col.key === 'name' && (
                              <button
                                className='font-medium text-blue-600 hover:text-blue-800 hover:underline'
                                onClick={() => handleAssignManager(zone)}
                              >
                                {zone.name}
                              </button>
                            )}
                            {col.key === 'manager' && (
                              <span className={zone.manager ? 'font-medium' : 'text-gray-500'}>
                                {zone.manager || 'No manager assigned'}
                              </span>
                            )}
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
                            {!['zoneType', 'name', 'manager', 'actions'].includes(col.key) && (
                              <>
                                {col.key === 'location' && (zone.location || zone.description || '-')}
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
          <CSVImportDialog
            open={importOpen}
            onOpenChange={setImportOpen}
            title='Import Zones'
            description='Bulk import zones from a CSV file. Zones will be created with the provided information.'
            fields={[
              { key: 'name', label: 'Zone Name', required: true, type: 'string' },
              { key: 'location', label: 'Location', required: false, type: 'string' },
              { key: 'zoneType', label: 'Zone Type', required: false, type: 'string' },
              { key: 'level', label: 'Security Level', required: false, type: 'number' },
              { key: 'manager', label: 'Manager', required: false, type: 'string' },
            ]}
            exampleData={[
              {
                name: 'Main Entrance',
                location: 'Building A - Floor 1',
                zoneType: 'Green',
                level: '2',
                manager: 'John Smith'
              },
              {
                name: 'Server Room',
                location: 'Building B - Basement',
                zoneType: 'Red',
                level: '4',
                manager: 'Jane Doe'
              }
            ]}
            onImport={handleImportZones}
            templateFileName='zones-template.csv'
          />
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

      <AssignZoneManagerDialog 
        open={managerDialogOpen} 
        onOpenChange={setManagerDialogOpen} 
        zone={selectedZone} 
      />
    </div>
  )
}
