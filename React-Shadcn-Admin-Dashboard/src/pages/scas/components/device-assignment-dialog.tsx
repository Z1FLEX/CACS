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
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Door } from '@/types/scas'
import type { DeviceUpdateDTO } from '@/types/device'
import { getDoors, subscribeDoors, updateDevice } from '@/services'

const schema = z.object({
  doorIds: z.array(z.string()),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: any
}

export default function DeviceAssignmentDialog({ open, onOpenChange, device }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { doorIds: [] } })
  const [doors, setDoors] = useState<Door[]>(() => getDoors())

  useEffect(() => {
    const unsub = subscribeDoors(setDoors)
    return unsub
  }, [])

  useEffect(() => {
    if (device && open) {
      form.reset({ doorIds: device.doorIds || [] })
    }
  }, [device, open, form])

  const onSubmit = async (vals: FormValues) => {
    if (!device) return

    const doorIds = vals.doorIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))

    const payload: DeviceUpdateDTO = {
      doorIds,
    }
    await updateDevice(String(device.id), payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Doors to Device</DialogTitle>
          <DialogDescription>
            Select which doors this device should be connected to.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-device-assignment' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <div className='text-sm font-medium'>Device: {device?.name}</div>
              <div className='text-sm text-muted-foreground'>Type: {device?.type}</div>
            </div>

            <FormField control={form.control} name='doorIds' render={({ field }) => (
              <FormItem>
                <FormLabel>Available Doors</FormLabel>
                <div className='space-y-2 max-h-48 overflow-y-auto border rounded p-2'>
                  {doors.length === 0 ? (
                    <div className='text-sm text-muted-foreground'>No doors available</div>
                  ) : (
                    doors.map((door) => (
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
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='scas-device-assignment'>
            Assign Doors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
