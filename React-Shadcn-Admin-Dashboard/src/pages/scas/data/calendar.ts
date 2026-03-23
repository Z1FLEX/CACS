import { CalendarEvent } from './schema';

export const eventTypes = {
  meeting: {
    label: 'Meeting',
    color: '#3b82f6'
  },
  task: {
    label: 'Task',
    color: '#10b981'
  },
  reminder: {
    label: 'Reminder',
    color: '#f59e0b'
  },
  appointment: {
    label: 'Appointment',
    color: '#8b5cf6'
  },
  personal: {
    label: 'Personal',
    color: '#ec4899'
  }
};

export const participants = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
  }
];

export const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    type: 'meeting',
    user: 'John Doe',
    googleMeetLink: 'https://meet.google.com/abc-defg-hij',
    description: 'Weekly team sync to discuss project progress',
    reminder: 15,
    attendees: ['John Doe', 'Jane Smith', 'Bob Johnson']
  },
  {
    id: '2',
    title: 'Code Review',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    type: 'task',
    user: 'Jane Smith',
    description: 'Review pull requests and provide feedback',
    reminder: 5,
    attendees: ['Jane Smith', 'Alice Brown']
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
    type: 'appointment',
    user: 'Bob Johnson',
    googleMeetLink: 'https://meet.google.com/xyz-1234-567',
    description: 'Discuss project requirements with client',
    reminder: 30,
    attendees: ['Bob Johnson', 'Charlie Wilson']
  },
  {
    id: '4',
    title: 'Lunch Break',
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
    type: 'personal',
    user: 'Alice Brown',
    description: 'Lunch with team',
    attendees: ['Alice Brown']
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
    type: 'reminder',
    user: 'Charlie Wilson',
    description: 'Final submission for Q1 project',
    reminder: 60,
    attendees: ['Charlie Wilson', 'John Doe']
  }
];
