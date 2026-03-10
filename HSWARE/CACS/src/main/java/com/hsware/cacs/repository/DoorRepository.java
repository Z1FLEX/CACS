package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Door;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoorRepository extends JpaRepository<Door, Integer> {

    List<Door> findByDeletedAtIsNull();

    Optional<Door> findByIdAndDeletedAtIsNull(Integer id);

    List<Door> findByZone_IdAndDeletedAtIsNull(Integer zoneId);
}
