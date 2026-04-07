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
import type { Schedule, ScheduleDay, DayOfWeek, TimeSlot } from '@/types/scas'

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
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
})

const schema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  timeSlots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule
  scheduleDay?: ScheduleDay | null
  selectedDate?: Date | null
  onSave: (schedule: Schedule) => void
  onDelete?: (scheduleDayId: string) => void
}

export default function ScheduleRuleDialog({ 
  open, 
  onOpenChange, 
  schedule, 
  scheduleDay, 
  selectedDate,
  onSave,
  onDelete 
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dayOfWeek: 'MONDAY',
      timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'timeSlots',
  })

  useEffect(() => {
    if (scheduleDay) {
      form.reset({
        dayOfWeek: scheduleDay.dayOfWeek,
        timeSlots: scheduleDay.timeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      })
    } else if (selectedDate) {
      const dayIndex = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay()
      const dayOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][dayIndex - 1] as DayOfWeek
      form.reset({
        dayOfWeek,
        timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
      })
    } else {
      form.reset({
        dayOfWeek: 'MONDAY',
        timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
      })
    }
  }, [scheduleDay, selectedDate, form])

  const onSubmit = (values: FormValues) => {
    const newTimeSlots: TimeSlot[] = values.timeSlots.map((slot, index) => ({
      id: `${Date.now()}-${index}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }))

    let updatedScheduleDays: ScheduleDay[]

    if (scheduleDay) {
      updatedScheduleDays = schedule.scheduleDays.map(day =>
        day.id === scheduleDay.id
          ? { ...day, timeSlots: newTimeSlots }
          : day
      )
    } else {
      const newScheduleDay: ScheduleDay = {
        id: `${Date.now()}`,
        dayOfWeek: values.dayOfWeek,
        timeSlots: newTimeSlots,
      }

      const existingDayIndex = schedule.scheduleDays.findIndex(day => day.dayOfWeek === values.dayOfWeek)
      
      if (existingDayIndex >= 0) {
        updatedScheduleDays = schedule.scheduleDays.map((day, index) =>
          index === existingDayIndex
            ? { ...day, timeSlots: [...day.timeSlots, ...newTimeSlots] }
            : day
        )
      } else {
        updatedScheduleDays = [...schedule.scheduleDays, newScheduleDay]
      }
    }

    const updatedSchedule: Schedule = {
      ...schedule,
      scheduleDays: updatedScheduleDays,
    }

    onSave(updatedSchedule)
    onOpenChange(false)
  }

  const addTimeSlot = () => {
    append({ startTime: '09:00', endTime: '17:00' })
  }

  const removeTimeSlot = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scheduleDay ? 'Edit Schedule Rule' : 'Add Schedule Rule'}
          </DialogTitle>
          <DialogDescription>
            {scheduleDay 
              ? 'Update the time slots for this day.'
              : 'Define time slots when access is allowed for this day.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    items={dayOptions}
                    placeholder="Select day"
                    isControlled
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Time Slots</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addTimeSlot} className="gap-2">
                    <IconPlus size={14} />
                    Add Time Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field: any, index: number) => (
                  <div key={field.id} className="flex gap-3 items-end p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <IconTrash size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <div className="flex justify-between w-full">
                {scheduleDay && onDelete && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => {
                      if (scheduleDay.id) {
                        onDelete(scheduleDay.id)
                        onOpenChange(false)
                      }
                    }}
                  >
                    Delete Rule
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {scheduleDay ? 'Update' : 'Add'} Rule
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
