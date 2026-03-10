package com.hsware.cacs.repository;

import com.hsware.cacs.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Integer> {

    List<Device> findByDeletedAtIsNull();

    Optional<Device> findByIdAndDeletedAtIsNull(Integer id);

    List<Device> findByDoor_IdAndDeletedAtIsNull(Integer doorId);
}
