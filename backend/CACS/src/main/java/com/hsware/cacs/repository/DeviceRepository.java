package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Device;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Integer> {

    @EntityGraph(attributePaths = {"zone"})
    List<Device> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"zone"})
    Optional<Device> findByIdAndDeletedAtIsNull(Integer id);

    @EntityGraph(attributePaths = {"zone"})
    List<Device> findByZone_IdAndDeletedAtIsNull(Integer zoneId);

    boolean existsByZone_IdAndDeletedAtIsNull(Integer zoneId);

    boolean existsBySerialNumberIgnoreCaseAndDeletedAtIsNull(String serialNumber);

    boolean existsBySerialNumberIgnoreCaseAndDeletedAtIsNullAndIdNot(String serialNumber, Integer id);

    @EntityGraph(attributePaths = {"zone"})
    Optional<Device> findByIdAndDeletedAtIsNullAndStatus(Integer id, String status);

    @EntityGraph(attributePaths = {"zone"})
    Optional<Device> findWithZoneByIdAndDeletedAtIsNull(Integer id);
}
