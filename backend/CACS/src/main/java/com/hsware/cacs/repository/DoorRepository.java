package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Door;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DoorRepository extends JpaRepository<Door, Integer> {

    @EntityGraph(attributePaths = {"zone", "device"})
    List<Door> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"zone", "device"})
    Optional<Door> findByIdAndDeletedAtIsNull(Integer id);

    @EntityGraph(attributePaths = {"zone", "device"})
    List<Door> findByZone_IdAndDeletedAtIsNull(Integer zoneId);

    @EntityGraph(attributePaths = {"device"})
    List<Door> findByDevice_IdAndDeletedAtIsNull(Integer deviceId);

    @EntityGraph(attributePaths = {"device"})
    List<Door> findByDevice_IdInAndDeletedAtIsNull(Collection<Integer> deviceIds);

    boolean existsByZone_IdAndDeletedAtIsNull(Integer zoneId);

    boolean existsByDevice_IdAndRelayIndexAndDeletedAtIsNull(Integer deviceId, Integer relayIndex);

    boolean existsByDevice_IdAndRelayIndexAndDeletedAtIsNullAndIdNot(Integer deviceId, Integer relayIndex, Integer id);
}
