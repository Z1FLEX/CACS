package com.hsware.cacs.service;

import com.hsware.cacs.entity.Schedule;
import com.hsware.cacs.entity.ScheduleDay;
import com.hsware.cacs.repository.ScheduleDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ScheduleEvaluationService {

    private final ScheduleDayRepository scheduleDayRepository;

    @Transactional(readOnly = true)
    public boolean isAccessAllowed(Set<Schedule> schedules, Instant occurredAt) {
        if (schedules == null || schedules.isEmpty()) {
            return false;
        }

        List<Integer> scheduleIds = schedules.stream()
            .filter(schedule -> schedule.getId() != null && schedule.getDeletedAt() == null)
            .map(Schedule::getId)
            .distinct()
            .toList();

        if (scheduleIds.isEmpty()) {
            return false;
        }

        ZoneId evaluationZone = ZoneId.systemDefault();
        DayOfWeek dayOfWeek = occurredAt.atZone(evaluationZone).getDayOfWeek();
        int dayIndex = mapDayOfWeek(dayOfWeek);
        LocalTime currentTime = occurredAt.atZone(evaluationZone).toLocalTime();

        List<ScheduleDay> scheduleDays = scheduleDayRepository.findForAccessEvaluationByScheduleIds(scheduleIds);

        return scheduleDays.stream()
            .filter(scheduleDay -> scheduleDay.getDayIndex() != null && scheduleDay.getDayIndex() == dayIndex)
            .flatMap(scheduleDay -> scheduleDay.getTimeSlots().stream())
            .anyMatch(timeSlot ->
                timeSlot.getStartTime() != null
                    && timeSlot.getEndTime() != null
                    && !currentTime.isBefore(timeSlot.getStartTime())
                    && currentTime.isBefore(timeSlot.getEndTime())
            );
    }

    private int mapDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> 1;
            case TUESDAY -> 2;
            case WEDNESDAY -> 3;
            case THURSDAY -> 4;
            case FRIDAY -> 5;
            case SATURDAY -> 6;
            case SUNDAY -> 7;
        };
    }
}
