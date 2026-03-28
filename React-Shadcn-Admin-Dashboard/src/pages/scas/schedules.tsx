import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import { Input } from "@/components/ui/input"
import { Trash2, X } from 'lucide-react'
import { addMinutes, format } from "date-fns"
import { Button } from '@/components/custom/button'
import { toast } from '@/components/ui/use-toast'
import { CalendarEvent } from './data/schema'

export default function SchedulesPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false)

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event
    setCurrentEvent({
      id: event.id,
      title: event.title,
      start: event.start || new Date(),
      end: event.end || new Date(),
    })
    setIsEventModalOpen(true)
  }

  const handleDateClick = (arg: any) => {
    const endTime = addMinutes(arg.date, 60)
    setCurrentEvent({
      id: '',
      title: '',
      start: arg.date,
      end: endTime,
    })
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!currentEvent) return

    setEvents(prevEvents => {
      const updatedEvents = currentEvent.id
        ? prevEvents.map(e => e.id === currentEvent.id ? currentEvent : e)
        : [...prevEvents, { ...currentEvent, id: Date.now().toString() }];
      return updatedEvents;
    });

    setIsEventModalOpen(false)
    setCurrentEvent(null)
    toast({
      title: "Event saved successfully!",
    })
  }

  const handleDeleteEvent = () => {
    if (currentEvent && currentEvent.id) {
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(e => e.id !== currentEvent.id);
        return updatedEvents;
      });
      setIsEventModalOpen(false)
      setCurrentEvent(null)
      toast({
        title: "Event deleted successfully!",
      })
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
              <Button variant='outline' onClick={() => handleDateClick({ date: new Date() } as any)}>+ Add Event</Button>
            </div>
          </div>
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
        </div>
      </div>

      {isEventModalOpen && currentEvent && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentEvent.id ? 'Edit Event' : 'Add Event'}</h3>
              <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}><X /></Button>
            </div>
            <Input
              className="mb-4"
              placeholder="Event Title"
              value={currentEvent.title}
              onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
            />
            <Input
              className="mb-4"
              placeholder="Start Time"
              type="time"
              value={format(new Date(currentEvent.start), "HH:mm")}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                const newStart = new Date(currentEvent.start)
                newStart.setHours(parseInt(hours), parseInt(minutes))
                setCurrentEvent({ ...currentEvent, start: newStart })
              }}
            />
            <Input
              className="mb-4"
              placeholder="End Time"
              type="time"
              value={format(new Date(currentEvent.end), "HH:mm")}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                const newEnd = new Date(currentEvent.end)
                newEnd.setHours(parseInt(hours), parseInt(minutes))
                setCurrentEvent({ ...currentEvent, end: newEnd })
              }}
            />
            <div className="flex justify-between space-x-2">
              <Button onClick={handleDeleteEvent} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div>
                <Button onClick={() => setIsEventModalOpen(false)} variant="outline" className="mr-2">Cancel</Button>
                <Button onClick={handleSaveEvent}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}