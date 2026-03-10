package com.hsware.cacs.service;

import com.hsware.cacs.entity.Schedule;
import com.hsware.cacs.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return scheduleRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return scheduleRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Schedule s = toEntity(body, null);
        s = scheduleRepository.save(s);
        return toMap(s);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<Schedule> existing = scheduleRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Schedule s = existing.get();
        applyBodyToSchedule(body, s);
        s = scheduleRepository.save(s);
        return Optional.of(toMap(s));
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

    public Map<String, Object> toMap(Schedule s) {
        return Map.of(
                "id", s.getId(),
                "name", nullToEmpty(s.getName()),
                "days", "",
                "startTime", "",
                "endTime", "",
                "zones", ""
        );
    }

    private Schedule toEntity(Map<String, Object> body, Integer id) {
        Schedule s = new Schedule();
        if (id != null) s.setId(id);
        applyBodyToSchedule(body, s);
        return s;
    }

    private void applyBodyToSchedule(Map<String, Object> body, Schedule s) {
        s.setName(getStr(body, "name"));
    }

    private static String getStr(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString().trim() : "";
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}
