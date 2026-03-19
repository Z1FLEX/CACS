package com.hsware.cacs.service;

import com.hsware.cacs.dto.ScheduleDTO;
import com.hsware.cacs.dto.ScheduleCreateDTO;
import com.hsware.cacs.dto.ScheduleUpdateDTO;
import com.hsware.cacs.entity.Schedule;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
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

}
