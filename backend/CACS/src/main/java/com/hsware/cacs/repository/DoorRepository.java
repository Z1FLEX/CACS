package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Door;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoorRepository extends JpaRepository<Door, Integer> {

    List<Door> findByDeletedAtIsNull();

    Optional<Door> findByIdAndDeletedAtIsNull(Integer id);

    List<Door> findByZone_IdAndDeletedAtIsNull(Integer zoneId);

    List<Door> findByDevice_IdAndDeletedAtIsNull(Integer deviceId);

    boolean existsByZone_IdAndDeletedAtIsNull(Integer zoneId);

    boolean existsByDevice_IdAndRelayIndexAndDeletedAtIsNull(Integer deviceId, Integer relayIndex);

    boolean existsByDevice_IdAndRelayIndexAndDeletedAtIsNullAndIdNot(Integer deviceId, Integer relayIndex, Integer id);
}
