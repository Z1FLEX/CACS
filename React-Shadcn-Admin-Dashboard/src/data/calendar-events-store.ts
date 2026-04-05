import { CalendarEvent, ScheduleEvent, TimeSlot } from '@/pages/scas/data/schema'
import { PersistedTimeSlotDTO, scheduleAPI } from '@/services/schedule-api'

type CalendarEventsSubscriber = (events: CalendarEvent[]) => void

let calendarEvents: CalendarEvent[] = []
let subscribers: CalendarEventsSubscriber[] = []
let currentSchedule: ScheduleEvent | null = null
let latestLoadRequestId = 0

function isValidDayIndex(dayIndex: number): boolean {
  return Number.isInteger(dayIndex) && dayIndex >= 1 && dayIndex <= 7
}

function toTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function toBackendDay(day: number): number {
  return day === 0 ? 7 : day // Convert 0 (Sunday) to 7 for backend
}

function getStartOfCalendarWeek(): Date {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay())
  sunday.setHours(0, 0, 0, 0)
  return sunday
}

function createDateTime(dayIndex: number, time: string): Date {
  const base = getStartOfCalendarWeek()

  const date = new Date(base)
  const normalizedDayIndex = isValidDayIndex(dayIndex) ? dayIndex : 1
  const calendarDayOffset = normalizedDayIndex === 7 ? 0 : normalizedDayIndex
  date.setDate(base.getDate() + calendarDayOffset)

  const [rawHours, rawMinutes] = time.split(':').map(Number)
  const hours = Number.isFinite(rawHours) ? rawHours : 0
  const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0
  date.setHours(hours, minutes, 0, 0)

  return date
}

// Convert TimeSlot to CalendarEvent
function timeSlotToCalendarEvent(timeSlot: TimeSlot, scheduleName: string, scheduleId: number): CalendarEvent {
  const startDate = createDateTime(timeSlot.dayIndex, timeSlot.startTime)
  const endDate = createDateTime(timeSlot.dayIndex, timeSlot.endTime)
  
  return {
    id: timeSlot.id.toString(),
    title: timeSlot.title?.trim() || scheduleName || 'Event',
    start: startDate,
    end: endDate,
    dayIndex: timeSlot.dayIndex,
    scheduleId,
    timeSlotId: timeSlot.id
  }
}

function notifySubscribers(): void {
  subscribers.forEach((callback) => callback(calendarEvents))
}

function upsertCalendarEvent(event: CalendarEvent): void {
  const existingIndex = calendarEvents.findIndex((current) => current.id === event.id)

  if (existingIndex === -1) {
    calendarEvents = [...calendarEvents, event]
  } else {
    calendarEvents = calendarEvents.map((current, index) =>
      index === existingIndex ? event : current
    )
  }

  notifySubscribers()
}

function toCalendarEventFromPersistedTimeSlot(
  timeSlot: PersistedTimeSlotDTO,
  scheduleId: number,
  fallbackTitle: string
): CalendarEvent {
  const scheduleName = currentSchedule?.id === scheduleId ? currentSchedule.name : ''

  return timeSlotToCalendarEvent(
    {
      id: timeSlot.id,
      title: timeSlot.title?.trim() || fallbackTitle,
      dayIndex: timeSlot.dayIndex,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    },
    scheduleName,
    scheduleId
  )
}

export async function loadCalendarEvents(scheduleId?: number): Promise<void> {
  const requestId = ++latestLoadRequestId

  try {
    let nextEvents: CalendarEvent[] = []
    let nextCurrentSchedule: ScheduleEvent | null = null

    if (scheduleId !== undefined) {
      const scheduleData = await scheduleAPI.getScheduleWithTimeSlots(scheduleId)
      nextCurrentSchedule = scheduleData

      nextEvents = scheduleData.timeSlots.map(slot =>
        timeSlotToCalendarEvent(slot, scheduleData.name, scheduleData.id)
      )
    } else {
      // Load all schedules and convert to calendar events
      const schedules = await scheduleAPI.getSchedules()
      
      for (const schedule of schedules) {
        try {
          const scheduleData = await scheduleAPI.getScheduleWithTimeSlots(schedule.id)
          const events = scheduleData.timeSlots.map(slot => 
            timeSlotToCalendarEvent(slot, scheduleData.name, scheduleData.id)
          )
          nextEvents.push(...events)
        } catch (error) {
          console.warn(`Could not load time slots for schedule ${schedule.id}:`, error)
        }
      }
    }

    if (requestId !== latestLoadRequestId) {
      return
    }

    currentSchedule = nextCurrentSchedule
    calendarEvents = nextEvents
    notifySubscribers()
  } catch (error) {
    console.error('Failed to load calendar events:', error)
    // Keep existing events on error
  }
}

export function getCalendarEvents(): CalendarEvent[] {
  return calendarEvents
}

export function setCalendarEvents(events: CalendarEvent[]): void {
  calendarEvents = events
  notifySubscribers()
}

export async function addCalendarEvent(event: CalendarEvent, scheduleId: number): Promise<void> {
  try {
    // Convert CalendarEvent to TimeSlot
    const startTime = new Date(event.start)
    const endTime = new Date(event.end)

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new Error('Event has invalid start or end date')
    }

    if (endTime <= startTime) {
      throw new Error('Event end time must be after start time')
    }
    
    const dayIndex = event.dayIndex ?? toBackendDay(startTime.getDay())
    if (!isValidDayIndex(dayIndex)) {
      throw new Error('Event has invalid day index')
    }

    const timeSlot = {
      title: event.title.trim(),
      dayIndex,
      startTime: toTimeString(startTime),
      endTime: toTimeString(endTime)
    }

    const persistedTimeSlot = await scheduleAPI.createTimeSlot(scheduleId, timeSlot)
    const persistedEvent = toCalendarEventFromPersistedTimeSlot(
      persistedTimeSlot,
      scheduleId,
      event.title.trim()
    )

    upsertCalendarEvent(persistedEvent)
  } catch (error) {
    console.error('Failed to add calendar event:', error)
    throw error
  }
}

export async function updateCalendarEvent(event: CalendarEvent): Promise<void> {
  try {
    if (!event.timeSlotId) {
      throw new Error('Event has no time slot ID')
    }

    // Convert CalendarEvent to TimeSlot update
    const startTime = new Date(event.start)
    const endTime = new Date(event.end)

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new Error('Event has invalid start or end date')
    }

    if (endTime <= startTime) {
      throw new Error('Event end time must be after start time')
    }

    const dayIndex = event.dayIndex ?? toBackendDay(startTime.getDay())
    if (!isValidDayIndex(dayIndex)) {
      throw new Error('Event has invalid day index')
    }
    
    const timeSlotUpdate = {
      title: event.title.trim(),
      dayIndex,
      startTime: toTimeString(startTime),
      endTime: toTimeString(endTime)
    }

    const scheduleId = event.scheduleId ?? currentSchedule?.id
    if (!scheduleId) {
      throw new Error('Event has no schedule ID')
    }

    const persistedTimeSlot = await scheduleAPI.updateTimeSlot(event.timeSlotId, timeSlotUpdate)
    const persistedEvent = toCalendarEventFromPersistedTimeSlot(
      persistedTimeSlot,
      scheduleId,
      event.title.trim()
    )

    upsertCalendarEvent(persistedEvent)
  } catch (error) {
    console.error('Failed to update calendar event:', error)
    throw error
  }
}

export async function removeCalendarEvent(id: string): Promise<void> {
  try {
    const event = calendarEvents.find(e => e.id === id)
    if (!event?.timeSlotId) {
      throw new Error('Event not found or has no time slot ID')
    }

    await scheduleAPI.deleteTimeSlot(event.timeSlotId)

    calendarEvents = calendarEvents.filter((current) => current.id !== id)
    notifySubscribers()
  } catch (error) {
    console.error('Failed to remove calendar event:', error)
    throw error
  }
}

export function subscribeCalendarEvents(callback: CalendarEventsSubscriber): () => void {
  subscribers.push(callback)
  callback(calendarEvents)
  
  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback)
  }
}

export function getCurrentSchedule(): ScheduleEvent | null {
  return currentSchedule
}

export function setCurrentSchedule(schedule: ScheduleEvent | null): void {
  currentSchedule = schedule
}
