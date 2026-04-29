package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {

    @EntityGraph(attributePaths = {"schedules", "zones"})
    List<Profile> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"schedules", "zones"})
    Optional<Profile> findByIdAndDeletedAtIsNull(Integer id);

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    boolean existsByNameIgnoreCaseAndDeletedAtIsNullAndIdNot(String name, Integer id);

    long countByZones_IdAndDeletedAtIsNull(Integer zoneId);

    long countBySchedules_IdAndDeletedAtIsNull(Integer scheduleId);
}
