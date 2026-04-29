package com.hsware.cacs.service;

import com.hsware.cacs.dto.DeviceDTO;
import com.hsware.cacs.dto.DeviceCreateDTO;
import com.hsware.cacs.dto.DeviceUpdateDTO;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DoorRepository doorRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<DeviceDTO> findAll(Integer zoneId, Boolean available) {
        List<Device> devices = zoneId != null
            ? deviceRepository.findByZone_IdAndDeletedAtIsNull(zoneId)
            : deviceRepository.findByDeletedAtIsNull();

        Map<Integer, Set<Integer>> occupiedRelaysByDeviceId = loadOccupiedRelaysByDeviceId(devices);

        return devices.stream()
                .map(device -> toDeviceDTOWithAvailability(device, occupiedRelaysByDeviceId.getOrDefault(device.getId(), Set.of())))
                .filter(deviceDTO -> !Boolean.TRUE.equals(available)
                    || (deviceDTO.getAvailableRelayIndices() != null && !deviceDTO.getAvailableRelayIndices().isEmpty()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DeviceDTO> findById(Integer id) {
        return deviceRepository.findByIdAndDeletedAtIsNull(id)
            .map(device -> toDeviceDTOWithAvailability(device, loadOccupiedRelays(device.getId())));
    }

    @Transactional
    public DeviceDTO create(DeviceCreateDTO dto) {
        ensureSerialNumberAvailable(dto.getSerialNumber(), null);
        Device device = dtoMapper.toDevice(dto);
        return toDeviceDTOWithAvailability(deviceRepository.save(device), Set.of());
    }

    @Transactional
    public DeviceDTO update(Integer id, DeviceUpdateDTO dto) {
        Device device = deviceRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new EntityNotFoundException("Device not found: " + id));
        if (dto.getSerialNumber() != null) {
            ensureSerialNumberAvailable(dto.getSerialNumber(), id);
        }
        Set<Integer> occupiedRelays = loadOccupiedRelays(id);
        if (dto.getRelayCount() != null && dto.getRelayCount() < device.getRelayCount()) {
            int highestAssignedRelay = occupiedRelays.stream().max(Integer::compareTo).orElse(0);
            if (highestAssignedRelay > dto.getRelayCount()) {
                throw new IllegalArgumentException("Relay count cannot be lower than an assigned door relay");
            }
        }
        dtoMapper.updateDeviceFromDTO(dto, device);
        return toDeviceDTOWithAvailability(deviceRepository.save(device), occupiedRelays);
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Device> existing = deviceRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        if (!doorRepository.findByDevice_IdAndDeletedAtIsNull(id).isEmpty()) {
            throw new IllegalArgumentException("Cannot delete a device that is still assigned to doors");
        }
        Device d = existing.get();
        d.setDeletedAt(java.time.Instant.now());
        deviceRepository.save(d);
        return true;
    }

    private DeviceDTO toDeviceDTOWithAvailability(Device device, Set<Integer> occupiedRelays) {
        DeviceDTO dto = dtoMapper.toDeviceDTO(device);
        dto.setAvailableRelayIndices(calculateAvailableRelayIndices(device, occupiedRelays));
        return dto;
    }

    private List<Integer> calculateAvailableRelayIndices(Device device, Set<Integer> occupiedRelays) {
        if (device.getId() == null || device.getRelayCount() == null || device.getRelayCount() <= 0) {
            return List.of();
        }

        List<Integer> availableRelays = new ArrayList<>();
        for (int relayIndex = 1; relayIndex <= device.getRelayCount(); relayIndex++) {
            if (!occupiedRelays.contains(relayIndex)) {
                availableRelays.add(relayIndex);
            }
        }
        return availableRelays;
    }

    private Map<Integer, Set<Integer>> loadOccupiedRelaysByDeviceId(List<Device> devices) {
        List<Integer> deviceIds = devices.stream()
            .map(Device::getId)
            .filter(id -> id != null)
            .toList();
        if (deviceIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return doorRepository.findByDevice_IdInAndDeletedAtIsNull(deviceIds).stream()
            .filter(door -> door.getDevice() != null && door.getDevice().getId() != null && door.getRelayIndex() != null)
            .collect(Collectors.groupingBy(
                door -> door.getDevice().getId(),
                Collectors.mapping(Door::getRelayIndex, Collectors.toSet())
            ));
    }

    private Set<Integer> loadOccupiedRelays(Integer deviceId) {
        if (deviceId == null) {
            return Set.of();
        }

        return doorRepository.findByDevice_IdAndDeletedAtIsNull(deviceId).stream()
            .map(Door::getRelayIndex)
            .filter(relayIndex -> relayIndex != null)
            .collect(Collectors.toSet());
    }

    private void ensureSerialNumberAvailable(String serialNumber, Integer currentDeviceId) {
        if (serialNumber == null || serialNumber.isBlank()) {
            return;
        }

        boolean exists = currentDeviceId == null
            ? deviceRepository.existsBySerialNumberIgnoreCaseAndDeletedAtIsNull(serialNumber.trim())
            : deviceRepository.existsBySerialNumberIgnoreCaseAndDeletedAtIsNullAndIdNot(serialNumber.trim(), currentDeviceId);

        if (exists) {
            throw new IllegalArgumentException("Device serial number already exists");
        }
    }

}
