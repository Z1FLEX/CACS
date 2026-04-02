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
import type { Zone } from '@/types/scas'
import { getZones, subscribeZones, addDoor, updateDoor } from '@/services'

const schema = z.object({
  name: z.string().min(1),
  zoneId: z.string().min(1),
  location: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: any | null
}

export default function AddDoorDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      zoneId: '',
      location: ''
    }
  })
  const [zones, setZones] = useState<Zone[]>(() => getZones())

  useEffect(() => {
    const unsub = subscribeZones(setZones)
    return unsub
  }, [])

  useEffect(() => {
    if (current) {
      form.reset({ name: current.name, zoneId: current.zoneId, location: current.location })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const updated = {
        ...current,
        name: vals.name,
        zoneId: parseInt(vals.zoneId),
        zoneName: zones.find(z => z.id === vals.zoneId)?.name || current.zoneName,
        location: vals.location || current.location,
      }
      await updateDoor(updated)
    } else {
      const id = String(Date.now())
      const zone = zones.find(z => z.id === vals.zoneId)
      const newDoor = {
        id,
        name: vals.name,
        zoneId: parseInt(vals.zoneId),
        zoneName: zone ? zone.name : 'Unknown',
        location: vals.location || '',
      }
      await addDoor(newDoor as any)
    }

    form.reset({
      name: '',
      zoneId: '',
      location: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(s) => { 
      form.reset({
        name: '',
        zoneId: '',
        location: ''
      }); 
      onOpenChange(s) 
    }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Door' : 'Add Door'}</DialogTitle>
          <DialogDescription>{current ? 'Update door details' : 'Create a new door'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-door' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Door name</FormLabel>
                <FormControl>
                  <Input placeholder='Main Entrance' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='zoneId' render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>
                <FormControl>
                  <SelectDropdown items={zones.map(z => ({ label: z.name, value: z.id }))} defaultValue={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='location' render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Building A - Floor 1' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-door'>{current ? 'Update Door' : 'Create Door'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
