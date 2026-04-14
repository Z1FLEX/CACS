package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Device;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Integer> {

    List<Device> findByDeletedAtIsNull();

    Optional<Device> findByIdAndDeletedAtIsNull(Integer id);

    List<Device> findByDoors_IdAndDeletedAtIsNull(Integer doorId);

    @EntityGraph(attributePaths = {"doors", "doors.zone"})
    Optional<Device> findByIdAndDeletedAtIsNullAndStatus(Integer id, String status);

    @EntityGraph(attributePaths = {"doors", "doors.zone"})
    Optional<Device> findWithDoorsAndZonesByIdAndDeletedAtIsNull(Integer id);
}
