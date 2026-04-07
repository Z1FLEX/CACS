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
import { addZone, updateZone, zoneTypeForUi, zoneTypeNameToId } from '@/services'

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
  location: z.string().optional(),
  zoneType: z.enum(['White', 'Green', 'Blue', 'Orange', 'Red', 'Black']),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', location: '', zoneType: 'White', manager: '' },
  })

  useEffect(() => {
    if (current) {
      const disp = zoneTypeForUi(current)
      const zoneTypeName = (disp?.name ?? 'White') as FormValues['zoneType']
      form.reset({
        name: current.name,
        location: current.location || current.description,
        zoneType: zoneTypeName,
        manager: current.manager,
      })
    } else if (open) {
      form.reset({ name: '', location: '', zoneType: 'White', manager: '' })
    }
  }, [current, open, form])

  const onSubmit = async (vals: FormValues) => {
    const tid = zoneTypeNameToId(vals.zoneType)
    if (current) {
      const updated = {
        ...current,
        name: vals.name,
        location: vals.location || '',
        manager: vals.manager || undefined,
        zoneType: { name: vals.zoneType, level: typeToLevel[vals.zoneType] },
        ...(tid != null ? { zoneTypeId: String(tid) } : {}),
      }
      await updateZone(updated)
    } else {
      await addZone({
        id: '',
        name: vals.name,
        location: vals.location || '',
        zoneType: { name: vals.zoneType, level: typeToLevel[vals.zoneType] },
        ...(tid != null ? { zoneTypeId: String(tid) } : {}),
      })
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
                    <SelectDropdown
                      isControlled
                      items={zoneTypes}
                      defaultValue={field.value ?? 'White'}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder='Location' {...field} />
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
