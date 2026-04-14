package com.hsware.cacs.repository;

import com.hsware.cacs.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Integer> {
    
    List<ScheduleDay> findByScheduleIdAndSchedule_DeletedAtIsNull(Integer scheduleId);
    
    Optional<ScheduleDay> findByScheduleIdAndDayIndexAndSchedule_DeletedAtIsNull(Integer scheduleId, Integer dayIndex);
    
    List<ScheduleDay> findBySchedule_DeletedAtIsNull();

    @Query("""
        SELECT DISTINCT sd
        FROM ScheduleDay sd
        LEFT JOIN FETCH sd.schedule s
        LEFT JOIN FETCH sd.timeSlots ts
        WHERE s.id IN :scheduleIds
          AND s.deletedAt IS NULL
        """)
    List<ScheduleDay> findForAccessEvaluationByScheduleIds(@Param("scheduleIds") List<Integer> scheduleIds);
}
