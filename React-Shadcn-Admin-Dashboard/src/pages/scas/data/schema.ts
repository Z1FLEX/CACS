export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  type: string;
  user: string;
  googleMeetLink?: string;
  description?: string;
  reminder?: number;
  attendees?: string[];
  rrule?: {
    freq: string;
    dtstart: string;
    until: string;
  };
}
