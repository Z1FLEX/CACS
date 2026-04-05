export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  dayIndex?: number; // 1-7 (Monday-Sunday)
  scheduleId?: number;
  timeSlotId?: number;
}

export interface ScheduleEvent {
  id: number;
  name: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: number;
  title?: string;
  dayIndex: number; // 1-7 (Monday-Sunday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}
