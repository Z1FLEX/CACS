import { CalendarEvent } from './schema';

export const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
  },
  {
    id: '2',
    title: 'Code Review',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
  },
  {
    id: '3',
    title: 'Client Call',
    start: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(11, 0, 0, 0);
      return date;
    })(),
    end: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(12, 0, 0, 0);
      return date;
    })(),
  },
  {
    id: '4',
    title: 'Lunch Break',
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
  },
  {
    id: '5',
    title: 'Project Deadline',
    start: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      date.setHours(17, 0, 0, 0);
      return date;
    })(),
    end: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      date.setHours(18, 0, 0, 0);
      return date;
    })(),
  }
];
