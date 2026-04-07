package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    List<Schedule> findByDeletedAtIsNull();

    Optional<Schedule> findByIdAndDeletedAtIsNull(Integer id);
}
