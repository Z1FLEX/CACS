import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import { EmptyState } from '@/components/custom/empty-state'
import type { Schedule } from '@/types/scas'
import { getSchedules, subscribeSchedules, loadSchedules, removeSchedule } from '@/services'
import AddScheduleDialog from './components/add-schedule-dialog'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

const scheduleColumns: ColumnConfig[] = [
  { key: 'name', label: 'Schedule Name', visible: true },
  { key: 'rules', label: 'Rules', visible: true },
  { key: 'zones', label: 'Applied to Zones', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(() => getSchedules())
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Schedule | null>(null)

  useEffect(() => {
    const unsub = subscribeSchedules(setSchedules)
    loadSchedules().then(() => {})
    return unsub
  }, [])

  const handleAddSchedule = () => {
    setCurrent(null)
    setOpen(true)
  }

  const handleEditSchedule = (id: string) => {
    const s = schedules.find((x) => x.id === id)
    if (s) {
      setCurrent(s)
      setOpen(true)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    await removeSchedule(id)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Access Schedules</h2>
          <p className='text-muted-foreground'>Define time-based access schedules for zones</p>
        </div>
        <Button onClick={handleAddSchedule} className='gap-2'>
          <IconPlus size={16} />
          Create Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <EmptyState
              title='No schedules yet'
              description='Create a schedule to define when access is allowed (e.g. business hours, weekend access).'
            />
          ) : (
            <TableDataWrapper
              data={schedules}
              columns={scheduleColumns}
              itemsPerPage={10}
              searchableFields={['name']}
            >
              {({ data, visibleColumns }) => (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {visibleColumns.map((col) => (
                          <TableHead key={col.key}>{col.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((schedule) => (
                        <TableRow key={schedule.id}>
                          {visibleColumns.map((col) => (
                            <TableCell key={`${schedule.id}-${col.key}`}>
                              {col.key === 'zones' && (
                                <Badge variant='secondary'>{schedule.zones ?? '0'} zones</Badge>
                              )}
                              {col.key === 'name' && <span className='font-medium'>{schedule.name}</span>}
                              {col.key === 'rules' && (
                                <span className='text-sm text-muted-foreground'>
                                  {schedule.scheduleDays?.length || 0} rules
                                </span>
                              )}
                              {col.key === 'actions' && (
                                <div className='flex gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleEditSchedule(schedule.id)}
                                  >
                                    <IconEdit size={16} />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <IconTrash size={16} />
                                  </Button>
                                </div>
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
        </CardContent>
      </Card>

      <AddScheduleDialog
        open={open}
        onOpenChange={(s) => {
          if (!s) setCurrent(null)
          setOpen(s)
        }}
        current={current}
      />
    </div>
  )
}
