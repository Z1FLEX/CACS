import { CalendarEvent } from '@/pages/scas/data/schema'

type CalendarEventsSubscriber = (events: CalendarEvent[]) => void

let calendarEvents: CalendarEvent[] = []
let subscribers: CalendarEventsSubscriber[] = []

export function getCalendarEvents(): CalendarEvent[] {
  return calendarEvents
}

export function setCalendarEvents(events: CalendarEvent[]): void {
  calendarEvents = events
  subscribers.forEach(callback => callback(calendarEvents))
}

export function addCalendarEvent(event: CalendarEvent): void {
  const existingIndex = calendarEvents.findIndex(e => e.id === event.id)
  if (existingIndex >= 0) {
    calendarEvents[existingIndex] = event
  } else {
    calendarEvents.push(event)
  }
  subscribers.forEach(callback => callback(calendarEvents))
}

export function removeCalendarEvent(id: string): void {
  calendarEvents = calendarEvents.filter(e => e.id !== id)
  subscribers.forEach(callback => callback(calendarEvents))
}

export function subscribeCalendarEvents(callback: CalendarEventsSubscriber): () => void {
  subscribers.push(callback)
  callback(calendarEvents)
  
  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback)
  }
}
