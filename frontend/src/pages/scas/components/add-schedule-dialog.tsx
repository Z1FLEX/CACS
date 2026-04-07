import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import type { Schedule, DayOfWeek } from '@/types/scas'
import { addSchedule, updateSchedule } from '@/services'

const dayOptions: { label: string; value: DayOfWeek }[] = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' },
]

const timeSlotSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
})

const schema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  zones: z.string().optional(),
  timeSlots: z.array(timeSlotSchema).min(1, 'At least one time rule is required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Schedule | null
}

export default function AddScheduleDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      zones: '',
      timeSlots: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'timeSlots',
  })

  useEffect(() => {
    if (current) {
      const timeSlots = current.scheduleDays?.map(day => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.timeSlots[0]?.startTime || '09:00',
        endTime: day.timeSlots[0]?.endTime || '17:00',
      })) || [{ dayOfWeek: 'MONDAY' as DayOfWeek, startTime: '09:00', endTime: '17:00' }]

      form.reset({
        name: current.name,
        zones: current.zones || '',
        timeSlots,
      })
    } else {
      form.reset({
        name: '',
        zones: '',
        timeSlots: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' }],
      })
    }
  }, [current, form])

  const onSubmit = async (vals: FormValues) => {
    // Convert form data to Schedule format
    const scheduleDays = vals.timeSlots.map((slot, index) => ({
      id: `${Date.now()}-${index}`,
      dayOfWeek: slot.dayOfWeek,
      timeSlots: [{
        id: `${Date.now()}-${index}-slot`,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }],
    }))

    const scheduleData: Schedule = {
      id: current?.id || String(Date.now()),
      name: vals.name,
      scheduleDays,
      zones: vals.zones || undefined,
    }

    if (current) {
      await updateSchedule(scheduleData)
    } else {
      await addSchedule(scheduleData)
    }

    form.reset({
      name: '',
      zones: '',
      timeSlots: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' }],
    })
    onOpenChange(false)
  }

  const addTimeSlot = () => {
    append({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        form.reset()
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
          <DialogDescription>
            {current ? 'Update the time-based access schedule.' : 'Define a new time-based access schedule with specific rules for each day.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-schedule' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Business Hours' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='zones'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applied to zones (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. 3 or 1,2,3' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base'>Time Rules</CardTitle>
                  <Button type='button' variant='outline' size='sm' onClick={addTimeSlot} className='gap-2'>
                    <IconPlus size={14} />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {fields.map((field, index) => (
                  <div key={field.id} className='flex gap-3 items-end p-4 border rounded-lg bg-muted/20'>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.dayOfWeek`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day</FormLabel>
                            <SelectDropdown
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                              items={dayOptions}
                              placeholder='Select day'
                              isControlled
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type='time' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type='time' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        className='text-destructive hover:text-destructive'
                      >
                        <IconTrash size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' form='scas-add-schedule'>
                {current ? 'Update' : 'Create'} schedule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
