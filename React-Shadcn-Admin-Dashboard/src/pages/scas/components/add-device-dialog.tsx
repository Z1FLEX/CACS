import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { SelectDropdown } from '@/components/select-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import type { Door } from '@/types/scas'
import { getDoors, subscribeDoors, addDevice, updateDevice } from '@/services'

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['reader', 'controller', 'lock']),
  doorIds: z.array(z.string()).optional(),
  status: z.enum(['online', 'offline']).optional(),
  lastActivity: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: any | null
}

export default function AddDeviceDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: 'online', type: 'reader', doorIds: [] } })
  const [doors, setDoors] = useState<Door[]>(() => getDoors())

  useEffect(() => {
    const unsub = subscribeDoors(setDoors)
    return unsub
  }, [])

  useEffect(() => {
    if (current) {
      form.reset({ 
        name: current.name, 
        type: current.type, 
        doorIds: current.doorIds || [], 
        status: current.status, 
        lastActivity: current.lastActivity 
      })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const selectedDoors = doors.filter(d => vals.doorIds?.includes(d.id))
      const updated = {
        ...current,
        name: vals.name,
        type: vals.type,
        doorIds: vals.doorIds || [],
        doorNames: selectedDoors.map(d => d.name),
        status: vals.status || current.status,
        lastActivity: vals.lastActivity || current.lastActivity,
      }
      await updateDevice(updated)
    } else {
      const id = String(Date.now())
      const selectedDoors = doors.filter(d => vals.doorIds?.includes(d.id))
      const newDevice = {
        id,
        name: vals.name,
        type: vals.type,
        doorIds: vals.doorIds || [],
        doorNames: selectedDoors.map(d => d.name),
        status: vals.status || 'online',
        lastActivity: vals.lastActivity || new Date().toISOString(),
      }
      await addDevice(newDevice as any)
    }

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(s) => { form.reset(); onOpenChange(s) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Device' : 'Add Device'}</DialogTitle>
          <DialogDescription>{current ? 'Update device details' : 'Create a new device'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-device' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Device name</FormLabel>
                <FormControl>
                  <Input placeholder='Entrance Reader' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='type' render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SelectDropdown items={[{ label: 'Reader', value: 'reader' }, { label: 'Controller', value: 'controller' }, { label: 'Lock', value: 'lock' }]} defaultValue={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='doorIds' render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Doors</FormLabel>
                <div className='space-y-2 max-h-32 overflow-y-auto border rounded p-2'>
                  {doors.map((door) => (
                    <div key={door.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={door.id}
                        checked={field.value?.includes(door.id) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || []
                          if (checked) {
                            field.onChange([...currentValues, door.id])
                          } else {
                            field.onChange(currentValues.filter((id: string) => id !== door.id))
                          }
                        }}
                      />
                      <label htmlFor={door.id} className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        {door.name}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='status' render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <SelectDropdown items={[{ label: 'Online', value: 'online' }, { label: 'Offline', value: 'offline' }]} defaultValue={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='lastActivity' render={({ field }) => (
              <FormItem>
                <FormLabel>Last Activity</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-device'>{current ? 'Update Device' : 'Create Device'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
