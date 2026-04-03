import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import type { Door, Zone } from '@/types/scas'
import { updateDoor } from '@/services'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  door: Door | null
  zones: Zone[]
  onSuccess?: () => Promise<void> | void
}

export default function DoorZoneAssignModal({ open, onOpenChange, door, zones, onSuccess }: Props) {
  const [query, setQuery] = useState('')
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  const currentZoneId = selectedZoneId ?? (door?.zoneId ? String(door.zoneId) : null)
  const currentZone = currentZoneId ? zones.find((z) => z.id === currentZoneId) : undefined

  const filteredZones = useMemo(
    () => zones.filter((z) => z.name.toLowerCase().includes(query.toLowerCase())),
    [zones, query]
  )

  const assignZone = async (zone: Zone) => {
    if (!door) return
    setSavingZoneId(zone.id)
    try {
      await updateDoor(String(door.id), { zoneId: zone.id, zoneName: zone.name })
      setSelectedZoneId(zone.id)
      if (onSuccess) await onSuccess()
    } finally {
      setSavingZoneId(null)
    }
  }

  const unassignZone = async () => {
    if (!door) return
    setSavingZoneId('__unassign__')
    try {
      await updateDoor(String(door.id), { zoneId: 0 as any, zoneName: '' })
      setSelectedZoneId(null)
      if (onSuccess) await onSuccess()
    } finally {
      setSavingZoneId(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setQuery('')
          setSelectedZoneId(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Assign Zone</DialogTitle>
          <DialogDescription>
            {door ? `Door: ${door.name}` : 'Select a door to manage zone assignment.'}
          </DialogDescription>
        </DialogHeader>

        {door ? (
          <div className='space-y-4'>
            <div className='rounded-md border p-3'>
              <div className='text-sm font-medium'>Current zone</div>
              {currentZone ? (
                <div className='mt-1 flex items-center justify-between gap-2'>
                  <div className='text-sm'>
                    <div className='font-medium'>{currentZone.name}</div>
                    <div className='text-muted-foreground'>{currentZone.location || 'No location'}</div>
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={unassignZone}
                    disabled={savingZoneId === '__unassign__'}
                  >
                    {savingZoneId === '__unassign__' ? 'Removing...' : 'Unassign'}
                  </Button>
                </div>
              ) : (
                <div className='mt-1 text-sm text-muted-foreground'>No zone assigned</div>
              )}
            </div>

            <Input
              placeholder='Search zones...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className='max-h-72 space-y-2 overflow-y-auto rounded-md border p-2'>
              {filteredZones.length === 0 ? (
                <div className='p-3 text-sm text-muted-foreground'>No zones found.</div>
              ) : (
                filteredZones.map((zone) => {
                  const isSelected = currentZoneId === zone.id
                  const isSaving = savingZoneId === zone.id
                  return (
                    <button
                      key={zone.id}
                      type='button'
                      onClick={() => assignZone(zone)}
                      disabled={isSaving}
                      className={`flex w-full items-start justify-between rounded-md border px-3 py-2 text-left transition ${
                        isSelected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <span>
                        <span className='block font-medium'>{zone.name}</span>
                        <span className='block text-sm text-muted-foreground'>{zone.location || 'No location'}</span>
                      </span>
                      <span className='text-sm'>
                        {isSaving ? 'Saving...' : isSelected ? '✓' : ''}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>No door selected.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
