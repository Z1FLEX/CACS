// no default React import required
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
import { addZone, updateZone } from '@/services'

const zoneTypes = [
  { label: 'White', value: 'White' },
  { label: 'Green', value: 'Green' },
  { label: 'Blue', value: 'Blue' },
  { label: 'Orange', value: 'Orange' },
  { label: 'Red', value: 'Red' },
  { label: 'Black', value: 'Black' },
]

const typeToLevel: Record<string, 0 | 1 | 2 | 3 | 4 | 5> = {
  White: 0,
  Green: 1,
  Blue: 2,
  Orange: 3,
  Red: 4,
  Black: 5,
}

const schema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
  doorsCount: z.number().min(0).optional(),
  zoneType: z.enum(['White', 'Green', 'Blue', 'Orange', 'Red', 'Black']),
  status: z.enum(['active', 'inactive']).optional(),
  manager: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Zone | null
}

import { useEffect } from 'react'

export default function AddZoneDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: 'active', doorsCount: 0 } })

  useEffect(() => {
    if (current) {
      const zoneTypeName = current.zoneType && typeof current.zoneType === 'object' && 'name' in current.zoneType ? current.zoneType.name : undefined
      form.reset({
        name: current.name,
        description: current.description,
        doorsCount: current.doorsCount,
        zoneType: zoneTypeName as FormValues['zoneType'],
        status: current.status,
        manager: current.manager,
      })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const updated = {
        ...current,
        name: vals.name,
        description: vals.description || '',
        doorsCount: vals.doorsCount || 0,
        status: vals.status || 'active',
        manager: vals.manager || undefined,
        zoneType: { name: vals.zoneType, level: typeToLevel[vals.zoneType] },
      }
      await updateZone(updated)
    } else {
      const id = String(Date.now())
      const newZone = {
        id,
        name: vals.name,
        description: vals.description || '',
        doorsCount: vals.doorsCount || 0,
        status: vals.status || 'active',
        manager: vals.manager || undefined,
        zoneType: {
          name: vals.zoneType,
          level: typeToLevel[vals.zoneType],
        },
      }

      await addZone(newZone as any)
    }

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        form.reset()
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Zone' : 'Create Zone'}</DialogTitle>
          <DialogDescription>{current ? 'Update zone details' : 'Add a new access zone'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-zone' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone name</FormLabel>
                  <FormControl>
                    <Input placeholder='Building A - Floor 4' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='zoneType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone Type</FormLabel>
                  <FormControl>
                    <SelectDropdown items={zoneTypes} defaultValue={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Short description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='doorsCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doors Count</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-zone'>{current ? 'Update Zone' : 'Create Zone'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
