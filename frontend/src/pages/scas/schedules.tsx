import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid/index.js'
import interactionPlugin from '@fullcalendar/interaction/index.js'
import { EventClickArg } from '@fullcalendar/core/index.js'
import { DateClickArg } from '@fullcalendar/interaction/index.js'
import { Input } from "@/components/ui/input"
import { Trash2, X } from 'lucide-react'
import { addMinutes, format } from "date-fns"
import { Button } from '@/components/custom/button'
import { toast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/custom/empty-state'
import { CalendarEvent } from './data/schema'
import { 
  loadCalendarEvents, 
  addCalendarEvent, 
  updateCalendarEvent, 
  removeCalendarEvent, 
  subscribeCalendarEvents
} from '@/data/calendar-events-store'
import { scheduleAPI, ScheduleDTO } from '@/services/schedule-api'

export default function SchedulesPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false)
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)
  const selectedSchedule = schedules.find(schedule => schedule.id === selectedScheduleId) || null
  const selectedScheduleName = selectedSchedule?.name || ''

  useEffect(() => {
    const initializeData = async () => {
      try {
        await refreshSchedules()
      } catch (error) {
        console.error('Failed to initialize data:', error)
        toast({
          title: "Error loading schedules",
          description: "Please check your connection and try again.",
          variant: "destructive"
        })
      }
    }
    
    initializeData()
    
    const unsubscribe = subscribeCalendarEvents(setEvents)
    return unsubscribe
  }, [])

  const refreshSchedules = async (preferredScheduleId?: number) => {
    const schedulesData = await scheduleAPI.getSchedules()
    setSchedules(schedulesData)

    if (schedulesData.length === 0) {
      setSelectedScheduleId(null)
      await loadCalendarEvents()
      return
    }

    const nextSelectedSchedule =
      schedulesData.find((schedule) => schedule.id === preferredScheduleId) ??
      schedulesData.find((schedule) => schedule.id === selectedScheduleId) ??
      schedulesData[0]

    setSelectedScheduleId(nextSelectedSchedule.id)
    await loadCalendarEvents(nextSelectedSchedule.id)
  }

  const handleScheduleChange = async (scheduleId: number) => {
    setSelectedScheduleId(scheduleId)
    await loadCalendarEvents(scheduleId)
  }

  const handleCreateSchedule = async () => {
    const trimmedName = newScheduleName.trim()
    if (!trimmedName) {
      toast({
        title: "Schedule name required",
        description: "Enter a name before creating a schedule.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingSchedule(true)
      const createdSchedule = await scheduleAPI.createSchedule({ name: trimmedName })
      await refreshSchedules(createdSchedule.id)
      setNewScheduleName('')
      setIsCreateScheduleModalOpen(false)
      toast({
        title: "Schedule created successfully!",
      })
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast({
        title: "Error creating schedule",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingSchedule(false)
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event
    const dayIndexFromStart = event.start ? (event.start.getDay() === 0 ? 7 : event.start.getDay()) : undefined
    setCurrentEvent({
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || new Date(),
      dayIndex: (event.extendedProps.dayIndex as number | undefined) ?? dayIndexFromStart,
      scheduleId: event.extendedProps.scheduleId as number | undefined,
      timeSlotId: event.extendedProps.timeSlotId as number | undefined,
    })
    setIsEventModalOpen(true)
  }

  const handleDateClick = (arg: DateClickArg) => {
    const endTime = addMinutes(arg.date, 60)
    const dayIndex = arg.date.getDay() === 0 ? 7 : arg.date.getDay() // Convert Sunday to 7
    
    setCurrentEvent({
      id: '',
      title: '',
      start: arg.date,
      end: endTime,
      dayIndex: dayIndex,
    })
    setIsEventModalOpen(true)
  }

  const handleAddEvent = () => {
    const now = new Date()
    const endTime = addMinutes(now, 60)
    
    setCurrentEvent({
      id: '',
      title: '',
      start: now,
      end: endTime,
      dayIndex: undefined, // Will be set by user in modal
    })
    setIsEventModalOpen(true)
  }

const handleSaveEvent = async () => {
  if (!currentEvent) return

  if (!selectedScheduleId) {
    toast({
      title: "No schedule selected",
      description: "Please select a schedule first.",
      variant: "destructive"
    })
    return
  }

  if (new Date(currentEvent.end) <= new Date(currentEvent.start)) {
    toast({
      title: "Invalid time range",
      description: "End time must be after start time.",
      variant: "destructive"
    })
    return
  }

  const eventToSave: CalendarEvent = {
    ...currentEvent,
    title: currentEvent.title.trim() || selectedScheduleName || 'Event',
    scheduleId: currentEvent.scheduleId ?? selectedScheduleId,
  }

  try {
    if (eventToSave.id) {
      // Update existing event
      await updateCalendarEvent(eventToSave)
      toast({
        title: "Event updated successfully!",
      })
    } else {
      // Create new event
      await addCalendarEvent(eventToSave, selectedScheduleId)
      toast({
        title: "Event created successfully!",
      })
    }

    setIsEventModalOpen(false)
    setCurrentEvent(null)
  } catch (error) {
    console.error('Failed to save event:', error)
    toast({
      title: "Error saving event",
      description: "Please try again.",
      variant: "destructive"
    })
  }
}

  const handleDeleteEvent = async () => {
    if (currentEvent && currentEvent.id) {
      try {
        await removeCalendarEvent(currentEvent.id)
        setIsEventModalOpen(false)
        setCurrentEvent(null)
        toast({
          title: "Event deleted successfully!",
        })
      } catch (error) {
        console.error('Failed to delete event:', error)
        toast({
          title: "Error deleting event",
          description: "Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const renderEventContent = (eventInfo: any) => {
    const event = eventInfo.event
    const startDate = event.start instanceof Date ? event.start : new Date(event.start)
    const endDate = event.end instanceof Date ? event.end : new Date(event.end)

    const isValidDate = (date: Date) => !isNaN(date.getTime())
    return (
      <>
        <div className={`p-1 rounded w-full`} style={{ backgroundColor: '#3b82f6' }}>
          <p className="font-bold">{event.title}</p>
          <p>
            {isValidDate(startDate) ? format(startDate, 'HH:mm') : 'Invalid start'} -
            {isValidDate(endDate) ? format(endDate, 'HH:mm') : 'Invalid end'}
          </p>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-screen overflow-auto no-scrollbar">
      <div className="flex-1 p-4">
        <div className="rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold tracking-tight">Weekly Schedule</h2>
            </div>
            <div className="space-x-2 flex items-center">
              {schedules.length > 0 && (
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedScheduleId ?? ''}
                  onChange={(e) => void handleScheduleChange(Number(e.target.value))}
                >
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </option>
                  ))}
                </select>
              )}
              <Button variant='outline' onClick={() => setIsCreateScheduleModalOpen(true)}>
                + Create Schedule
              </Button>
              <Button variant='outline' onClick={handleAddEvent} disabled={!selectedScheduleId}>
                + Add Event
              </Button>
            </div>
          </div>
          {schedules.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16">
              <EmptyState
                title="No schedules yet"
                description="Create a schedule first, then you can start adding weekly events."
              />
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              allDaySlot={false}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              height="auto"
              events={events}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventContent={renderEventContent}
              views={{
                timeGridWeek: {
                  titleFormat: { weekday: 'long' },
                  dayHeaderFormat: { weekday: 'short' }
                }
              }}
              dayHeaderFormat={{ weekday: 'short' }}
            />
          )}
        </div>
      </div>

      {isCreateScheduleModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Schedule</h3>
              <Button variant="ghost" onClick={() => setIsCreateScheduleModalOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Schedule Name</label>
              <Input
                placeholder="e.g. Business Hours"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} loading={isCreatingSchedule}>
                Create Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && currentEvent && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentEvent.id ? 'Edit Event' : 'Add Event'}</h3>
              <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}><X /></Button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Event Name</label>
              <Input
                placeholder="Event name"
                value={currentEvent.title}
                onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Day</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvent.dayIndex || ''}
                onChange={(e) => setCurrentEvent({ ...currentEvent, dayIndex: parseInt(e.target.value) || undefined })}
              >
                <option value="">Select a day</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <Input
                placeholder="Start Time"
                type="time"
                value={format(new Date(currentEvent.start), "HH:mm")}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [hours, minutes] = e.target.value.split(':')
                  const newStart = new Date(currentEvent.start)
                  newStart.setHours(parseInt(hours), parseInt(minutes))
                  setCurrentEvent({ ...currentEvent, start: newStart })
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">End Time</label>
              <Input
                placeholder="End Time"
                type="time"
                value={format(new Date(currentEvent.end), "HH:mm")}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [hours, minutes] = e.target.value.split(':')
                  const newEnd = new Date(currentEvent.end)
                  newEnd.setHours(parseInt(hours), parseInt(minutes))
                  setCurrentEvent({ ...currentEvent, end: newEnd })
                }}
              />
            </div>
            <div className="flex justify-between space-x-2">
              {currentEvent.id ? (
                <Button onClick={handleDeleteEvent} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div>
                <Button onClick={() => setIsEventModalOpen(false)} variant="outline" className="mr-2">Cancel</Button>
                <Button onClick={handleSaveEvent} disabled={!currentEvent.dayIndex || !currentEvent.title.trim()}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
