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
import type { Door } from '@/types/scas'
import { getDoors, subscribeDoors, addDevice, updateDevice } from '@/services'

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['reader', 'controller', 'lock']),
  doorId: z.string().min(1),
  location: z.string().optional(),
  status: z.enum(['online', 'offline']).optional(),
  lastHeartbeat: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: any | null
}

export default function AddDeviceDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: 'online', type: 'reader' } })
  const [doors, setDoors] = useState<Door[]>(() => getDoors())

  useEffect(() => {
    const unsub = subscribeDoors(setDoors)
    return unsub
  }, [])

  useEffect(() => {
    if (current) {
      form.reset({ name: current.name, type: current.type, doorId: current.doorId, location: current.location, status: current.status, lastHeartbeat: current.lastHeartbeat })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const updated = {
        ...current,
        name: vals.name,
        type: vals.type,
        doorId: vals.doorId,
        doorName: doors.find(d => d.id === vals.doorId)?.name || current.doorName,
        location: vals.location || current.location,
        status: vals.status || current.status,
        lastHeartbeat: vals.lastHeartbeat || current.lastHeartbeat,
      }
      await updateDevice(updated)
    } else {
      const id = String(Date.now())
      const door = doors.find(d => d.id === vals.doorId)
      const newDevice = {
        id,
        name: vals.name,
        type: vals.type,
        doorId: vals.doorId,
        doorName: door ? door.name : 'Unknown',
        location: vals.location || '',
        status: vals.status || 'online',
        lastHeartbeat: vals.lastHeartbeat || new Date().toISOString(),
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

            <FormField control={form.control} name='doorId' render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Door</FormLabel>
                <FormControl>
                  <SelectDropdown items={doors.map(d => ({ label: d.name, value: d.id }))} defaultValue={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='location' render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Building A - Lobby' {...field} />
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
