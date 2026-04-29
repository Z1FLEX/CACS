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
import com.hsware.cacs.repository.ProfileRepository;
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
    private final ProfileRepository profileRepository;
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
        ensureScheduleNameAvailable(scheduleCreateDTO.getName(), null);
        Schedule schedule = dtoMapper.toSchedule(scheduleCreateDTO);
        schedule = scheduleRepository.save(schedule);
        return dtoMapper.toScheduleDTO(schedule);
    }

    @Transactional
    public Optional<ScheduleDTO> update(Integer id, ScheduleUpdateDTO scheduleUpdateDTO) {
        Optional<Schedule> existing = scheduleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Schedule schedule = existing.get();
        if (scheduleUpdateDTO.getName() != null) {
            ensureScheduleNameAvailable(scheduleUpdateDTO.getName(), id);
        }
        dtoMapper.updateScheduleFromDTO(scheduleUpdateDTO, schedule);
        schedule = scheduleRepository.save(schedule);
        return Optional.of(dtoMapper.toScheduleDTO(schedule));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Schedule> existing = scheduleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        if (profileRepository.countBySchedules_IdAndDeletedAtIsNull(id) > 0) {
            throw new IllegalArgumentException("Cannot delete a schedule that is still assigned to profiles");
        }
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
        LocalTime startTime = LocalTime.parse(dto.getStartTime());
        LocalTime endTime = LocalTime.parse(dto.getEndTime());
        validateTimeSlotRange(startTime, endTime);

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
        timeSlot.setStartTime(startTime);
        timeSlot.setEndTime(endTime);
        timeSlot = dayTimeSlotRepository.save(timeSlot);

        return dtoMapper.toTimeSlotDTO(timeSlot);
    }

    @Transactional
    public Optional<TimeSlotDTO> updateTimeSlot(Integer timeSlotId, TimeSlotUpdateDTO dto) {
        Optional<DayTimeSlot> existing = dayTimeSlotRepository.findByIdAndScheduleDay_Schedule_DeletedAtIsNull(timeSlotId);
        if (existing.isEmpty()) return Optional.empty();
        
        DayTimeSlot timeSlot = existing.get();
        LocalTime effectiveStartTime = dto.getStartTime() != null ? LocalTime.parse(dto.getStartTime()) : timeSlot.getStartTime();
        LocalTime effectiveEndTime = dto.getEndTime() != null ? LocalTime.parse(dto.getEndTime()) : timeSlot.getEndTime();
        validateTimeSlotRange(effectiveStartTime, effectiveEndTime);
        
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
            timeSlot.setStartTime(effectiveStartTime);
        }
        if (dto.getEndTime() != null) {
            timeSlot.setEndTime(effectiveEndTime);
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

    private void validateTimeSlotRange(LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Time slot end time must be after start time; overnight slots are not supported");
        }
    }

    private void ensureScheduleNameAvailable(String name, Integer currentScheduleId) {
        if (name == null || name.isBlank()) {
            return;
        }

        boolean exists = currentScheduleId == null
            ? scheduleRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(name.trim())
            : scheduleRepository.existsByNameIgnoreCaseAndDeletedAtIsNullAndIdNot(name.trim(), currentScheduleId);

        if (exists) {
            throw new IllegalArgumentException("Schedule name already exists");
        }
    }

}
