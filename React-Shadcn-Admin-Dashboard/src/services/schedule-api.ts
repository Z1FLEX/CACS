import { api } from '@/api/client'
const API_PREFIX = '/api'

export interface ScheduleDTO {
  id: number
  name: string
  days: string
  startTime: string
  endTime: string
  zones: string
  createdAt: string
}

export interface ScheduleCreateDTO {
  name: string
}

export interface ScheduleUpdateDTO {
  name?: string
}

export interface TimeSlotCreateDTO {
  title?: string
  dayIndex: number
  startTime: string
  endTime: string
}

export interface ScheduleWithTimeSlots {
  id: number
  name: string
  timeSlots: TimeSlotDTO[]
}

interface TimeSlotDTO {
  id: number
  title?: string
  dayIndex: number
  startTime: string
  endTime: string
}

class ScheduleAPI {
  async getSchedules(): Promise<ScheduleDTO[]> {
    const response = await api.get(`${API_PREFIX}/schedules`)
    return response.data
  }

  async getSchedule(id: number): Promise<ScheduleDTO> {
    const response = await api.get(`${API_PREFIX}/schedules/${id}`)
    return response.data
  }

  async createSchedule(data: ScheduleCreateDTO): Promise<ScheduleDTO> {
    const response = await api.post(`${API_PREFIX}/schedules`, data)
    return response.data
  }

  async updateSchedule(id: number, data: ScheduleUpdateDTO): Promise<ScheduleDTO> {
    const response = await api.put(`${API_PREFIX}/schedules/${id}`, data)
    return response.data
  }

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`${API_PREFIX}/schedules/${id}`)
  }

  // For the calendar view, we need to work with time slots
  async getScheduleWithTimeSlots(id: number): Promise<ScheduleWithTimeSlots> {
    const schedule = await this.getSchedule(id)
    const timeSlots = await api.get<TimeSlotDTO[]>(`${API_PREFIX}/schedules/${id}/timeslots`)
    
    return {
      id: schedule.id,
      name: schedule.name,
      timeSlots: timeSlots.data.map((slot) => ({
        id: slot.id,
        title: slot.title,
        dayIndex: slot.dayIndex,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    }
  }

  // Create a time slot for a specific day
  async createTimeSlot(scheduleId: number, timeSlot: TimeSlotCreateDTO): Promise<void> {
    await api.post(`${API_PREFIX}/schedules/${scheduleId}/timeslots`, timeSlot)
  }

  // Update a time slot
  async updateTimeSlot(timeSlotId: number, timeSlot: Partial<TimeSlotCreateDTO>): Promise<void> {
    await api.put(`${API_PREFIX}/timeslots/${timeSlotId}`, timeSlot)
  }

  // Delete a time slot
  async deleteTimeSlot(timeSlotId: number): Promise<void> {
    await api.delete(`${API_PREFIX}/timeslots/${timeSlotId}`)
  }
}

export const scheduleAPI = new ScheduleAPI()
