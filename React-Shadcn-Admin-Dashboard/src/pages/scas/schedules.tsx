import { useEffect, useRef, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { addMinutes, format } from "date-fns"
import { Button } from '@/components/custom/button'
import { toast } from '@/components/ui/use-toast'
import { CalendarEvent } from './data/schema'
import { initialEvents } from './data/calendar'

export default function SchedulesPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [calendarView, setCalendarView] = useState<string>("dayGridMonth")
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [calendarTitle, setCalendarTitle] = useState<string>('');

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

  const handleViewChange = (view: string) => {
    setCalendarView(view)
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.changeView(view)
  }

  const updateCalendarTitle = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCalendarTitle(calendarApi.view.title);
    }
  }, []);

  const changeCalendarView = useCallback((direction: 'prev' | 'next') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') {
        calendarApi.prev();
      } else {
        calendarApi.next();
      }
      updateCalendarTitle();
    }
  }, [updateCalendarTitle]);

  const goToToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(new Date());
      updateCalendarTitle();
    }
  }, [updateCalendarTitle]);

  useEffect(() => {
    updateCalendarTitle();
  }, [updateCalendarTitle]);

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
              <Button variant='outline' onClick={() => changeCalendarView('prev')}>Prev</Button>
              <Button variant='outline'>{calendarTitle}</Button>
              <Button variant='outline' onClick={() => changeCalendarView('next')}>Next</Button>
              <Button variant='outline' onClick={goToToday}>Today</Button>
            </div>
            <div className="space-x-2 flex items-center">
              <Button
                variant={calendarView === 'dayGridDay' ? 'destructive' : 'outline'}
                onClick={() => handleViewChange('dayGridDay')}
              >
                Daily
              </Button>
              <Button
                variant={calendarView === 'timeGridWeek' ? 'destructive' : 'outline'}
                onClick={() => handleViewChange('timeGridWeek')}
              >
                Weekly
              </Button>
              <Button
                variant={calendarView === 'dayGridMonth' ? 'destructive' : 'outline'}
                onClick={() => handleViewChange('dayGridMonth')}
              >
                Monthly
              </Button>
              <Button
                variant={calendarView === 'listWeek' ? 'destructive' : 'outline'}
                onClick={() => handleViewChange('listWeek')}
              >
                List
              </Button>
              <Button variant='outline' onClick={() => handleDateClick({ date: new Date() } as any)}>+ Add Event</Button>
            </div>
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={calendarView}
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            height="auto"
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventContent={renderEventContent}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mb-4",
                    !currentEvent.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentEvent.start ? format(new Date(currentEvent.start), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(currentEvent.start)}
                  onSelect={(date) => date && setCurrentEvent({ ...currentEvent, start: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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