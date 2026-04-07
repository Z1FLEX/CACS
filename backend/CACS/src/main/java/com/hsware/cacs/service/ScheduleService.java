package com.hsware.cacs.service;

import com.hsware.cacs.dto.ScheduleDTO;
import com.hsware.cacs.dto.ScheduleCreateDTO;
import com.hsware.cacs.dto.ScheduleUpdateDTO;
import com.hsware.cacs.dto.TimeSlotDTO;
import com.hsware.cacs.dto.TimeSlotCreateDTO;
import com.hsware.cacs.dto.TimeSlotUpdateDTO;
import com.hsware.cacs.entity.Schedule;
import com.hsware.cacs.entity.ScheduleDay;
import com.hsware.cacs.entity.DayTimeSlot;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.ScheduleRepository;
import com.hsware.cacs.repository.ScheduleDayRepository;
import com.hsware.cacs.repository.DayTimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleDayRepository scheduleDayRepository;
    private final DayTimeSlotRepository dayTimeSlotRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<ScheduleDTO> findAll() {
        return scheduleRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toScheduleDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ScheduleDTO> findById(Integer id) {
        return scheduleRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toScheduleDTO);
    }

    @Transactional
    public ScheduleDTO create(ScheduleCreateDTO scheduleCreateDTO) {
        Schedule schedule = dtoMapper.toSchedule(scheduleCreateDTO);
        schedule = scheduleRepository.save(schedule);
        return dtoMapper.toScheduleDTO(schedule);
    }

    @Transactional
    public Optional<ScheduleDTO> update(Integer id, ScheduleUpdateDTO scheduleUpdateDTO) {
        Optional<Schedule> existing = scheduleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Schedule schedule = existing.get();
        dtoMapper.updateScheduleFromDTO(scheduleUpdateDTO, schedule);
        schedule = scheduleRepository.save(schedule);
        return Optional.of(dtoMapper.toScheduleDTO(schedule));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Schedule> existing = scheduleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Schedule s = existing.get();
        s.setDeletedAt(java.time.Instant.now());
        scheduleRepository.save(s);
        return true;
    }

    // Time slot management methods
    
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getTimeSlotsBySchedule(Integer scheduleId) {
        List<ScheduleDay> scheduleDays = scheduleDayRepository.findByScheduleIdAndSchedule_DeletedAtIsNull(scheduleId);
        return scheduleDays.stream()
                .flatMap(scheduleDay -> 
                    dayTimeSlotRepository.findByScheduleDayId(scheduleDay.getId()).stream()
                        .map(timeSlot -> dtoMapper.toTimeSlotDTO(timeSlot))
                )
                .collect(Collectors.toList());
    }

    @Transactional
    public TimeSlotDTO createTimeSlot(Integer scheduleId, TimeSlotCreateDTO dto) {
        // Find or create the schedule day
        Optional<ScheduleDay> scheduleDayOpt = scheduleDayRepository
                .findByScheduleIdAndDayIndexAndSchedule_DeletedAtIsNull(scheduleId, dto.getDayIndex());
        
        ScheduleDay scheduleDay;
        if (scheduleDayOpt.isPresent()) {
            scheduleDay = scheduleDayOpt.get();
        } else {
            // Create new schedule day
            Schedule schedule = scheduleRepository.findByIdAndDeletedAtIsNull(scheduleId)
                    .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));
            
            scheduleDay = new ScheduleDay();
            scheduleDay.setSchedule(schedule);
            scheduleDay.setDayIndex(dto.getDayIndex());
            scheduleDay = scheduleDayRepository.save(scheduleDay);
        }

        // Create time slot
        DayTimeSlot timeSlot = new DayTimeSlot();
        timeSlot.setScheduleDay(scheduleDay);
        timeSlot.setTitle(dto.getTitle() != null && !dto.getTitle().isBlank() ? dto.getTitle().trim() : scheduleDay.getSchedule().getName());
        timeSlot.setStartTime(LocalTime.parse(dto.getStartTime()));
        timeSlot.setEndTime(LocalTime.parse(dto.getEndTime()));
        timeSlot = dayTimeSlotRepository.save(timeSlot);

        return dtoMapper.toTimeSlotDTO(timeSlot);
    }

    @Transactional
    public Optional<TimeSlotDTO> updateTimeSlot(Integer timeSlotId, TimeSlotUpdateDTO dto) {
        Optional<DayTimeSlot> existing = dayTimeSlotRepository.findByIdAndScheduleDay_Schedule_DeletedAtIsNull(timeSlotId);
        if (existing.isEmpty()) return Optional.empty();
        
        DayTimeSlot timeSlot = existing.get();
        
        if (dto.getDayIndex() != null && !dto.getDayIndex().equals(timeSlot.getScheduleDay().getDayIndex())) {
            // Move to different day
            Integer scheduleId = timeSlot.getScheduleDay().getSchedule().getId();
            Optional<ScheduleDay> newScheduleDayOpt = scheduleDayRepository
                    .findByScheduleIdAndDayIndexAndSchedule_DeletedAtIsNull(scheduleId, dto.getDayIndex());
            
            ScheduleDay newScheduleDay;
            if (newScheduleDayOpt.isPresent()) {
                newScheduleDay = newScheduleDayOpt.get();
            } else {
                Schedule schedule = timeSlot.getScheduleDay().getSchedule();
                newScheduleDay = new ScheduleDay();
                newScheduleDay.setSchedule(schedule);
                newScheduleDay.setDayIndex(dto.getDayIndex());
                newScheduleDay = scheduleDayRepository.save(newScheduleDay);
            }
            timeSlot.setScheduleDay(newScheduleDay);
        }
        
        if (dto.getStartTime() != null) {
            timeSlot.setStartTime(LocalTime.parse(dto.getStartTime()));
        }
        if (dto.getEndTime() != null) {
            timeSlot.setEndTime(LocalTime.parse(dto.getEndTime()));
        }
        if (dto.getTitle() != null) {
            timeSlot.setTitle(dto.getTitle().isBlank() ? timeSlot.getScheduleDay().getSchedule().getName() : dto.getTitle().trim());
        }
        
        timeSlot = dayTimeSlotRepository.save(timeSlot);
        return Optional.of(dtoMapper.toTimeSlotDTO(timeSlot));
    }

    @Transactional
    public boolean deleteTimeSlot(Integer timeSlotId) {
        Optional<DayTimeSlot> existing = dayTimeSlotRepository.findByIdAndScheduleDay_Schedule_DeletedAtIsNull(timeSlotId);
        if (existing.isEmpty()) return false;
        
        dayTimeSlotRepository.delete(existing.get());
        return true;
    }

}
