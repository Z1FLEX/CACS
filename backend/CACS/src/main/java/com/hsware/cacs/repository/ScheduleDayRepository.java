package com.hsware.cacs.repository;

import com.hsware.cacs.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Integer> {
    
    List<ScheduleDay> findByScheduleIdAndSchedule_DeletedAtIsNull(Integer scheduleId);
    
    Optional<ScheduleDay> findByScheduleIdAndDayIndexAndSchedule_DeletedAtIsNull(Integer scheduleId, Integer dayIndex);
    
    List<ScheduleDay> findBySchedule_DeletedAtIsNull();
}
