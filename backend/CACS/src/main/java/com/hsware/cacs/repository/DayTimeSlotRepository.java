package com.hsware.cacs.repository;

import com.hsware.cacs.entity.DayTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DayTimeSlotRepository extends JpaRepository<DayTimeSlot, Integer> {
    
    List<DayTimeSlot> findByScheduleDayId(Integer scheduleDayId);
    
    Optional<DayTimeSlot> findByIdAndScheduleDay_Schedule_DeletedAtIsNull(Integer id);
    
    List<DayTimeSlot> findByScheduleDay_Schedule_IdAndScheduleDay_Schedule_DeletedAtIsNull(Integer scheduleId);
}
