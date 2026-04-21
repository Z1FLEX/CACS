package com.hsware.cacs.service;

import com.hsware.cacs.dto.DoorDTO;
import com.hsware.cacs.dto.DoorCreateDTO;
import com.hsware.cacs.dto.DoorUpdateDTO;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoorService {

    private final DoorRepository doorRepository;
    private final DeviceRepository deviceRepository;
    private final ZoneRepository zoneRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<DoorDTO> findAll() {
        return doorRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toDoorDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DoorDTO> findById(Integer id) {
        return doorRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toDoorDTO);
    }

    @Transactional
    public DoorDTO create(DoorCreateDTO doorCreateDTO) {
        Door door = dtoMapper.toDoor(doorCreateDTO);
        validateDoorInfrastructure(null, door);
        door = doorRepository.save(door);
        return dtoMapper.toDoorDTO(door);
    }

    @Transactional
    public Optional<DoorDTO> update(Integer id, DoorUpdateDTO doorUpdateDTO) {
        Optional<Door> existing = doorRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Door door = existing.get();
        dtoMapper.updateDoorFromDTO(doorUpdateDTO, door);
        validateDoorInfrastructure(id, door);
        door = doorRepository.save(door);
        return Optional.of(dtoMapper.toDoorDTO(door));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Door> existing = doorRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Door d = existing.get();
        d.setDeletedAt(java.time.Instant.now());
        doorRepository.save(d);
        return true;
    }

    private void validateDoorInfrastructure(Integer doorId, Door door) {
        Zone zone = door.getZone();
        if (zone == null || zone.getId() == null) {
            throw new IllegalArgumentException("Door zone is required");
        }
        if (!zoneRepository.existsById(zone.getId())) {
            throw new IllegalArgumentException("Selected zone does not exist");
        }

        Device device = door.getDevice();
        Integer relayIndex = door.getRelayIndex();

        if (device == null) {
            if (relayIndex != null) {
                throw new IllegalArgumentException("Relay index requires a selected device");
            }
            return;
        }

        Device managedDevice = deviceRepository.findByIdAndDeletedAtIsNull(device.getId())
            .orElseThrow(() -> new IllegalArgumentException("Selected device does not exist"));

        if (managedDevice.getZone() == null || !managedDevice.getZone().getId().equals(zone.getId())) {
            throw new IllegalArgumentException("Door zone must match the selected device zone");
        }

        if (relayIndex == null) {
            throw new IllegalArgumentException("Relay index is required when a device is selected");
        }
        if (relayIndex < 1 || relayIndex > managedDevice.getRelayCount()) {
            throw new IllegalArgumentException("Relay index is outside the selected device capacity");
        }

        boolean relayOccupied = doorId == null
            ? doorRepository.existsByDevice_IdAndRelayIndexAndDeletedAtIsNull(managedDevice.getId(), relayIndex)
            : doorRepository.existsByDevice_IdAndRelayIndexAndDeletedAtIsNullAndIdNot(managedDevice.getId(), relayIndex, doorId);

        if (relayOccupied) {
            throw new IllegalArgumentException("Selected relay is already assigned to another door");
        }

        door.setDevice(managedDevice);
        door.setRelayIndex(relayIndex);
    }

}
