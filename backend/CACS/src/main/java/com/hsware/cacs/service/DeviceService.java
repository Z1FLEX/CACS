package com.hsware.cacs.service;

import com.hsware.cacs.dto.DeviceDTO;
import com.hsware.cacs.dto.DeviceCreateDTO;
import com.hsware.cacs.dto.DeviceUpdateDTO;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
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

        return devices.stream()
                .map(this::toDeviceDTOWithAvailability)
                .filter(deviceDTO -> !Boolean.TRUE.equals(available)
                    || (deviceDTO.getAvailableRelayIndices() != null && !deviceDTO.getAvailableRelayIndices().isEmpty()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DeviceDTO> findById(Integer id) {
        return deviceRepository.findByIdAndDeletedAtIsNull(id).map(this::toDeviceDTOWithAvailability);
    }

    @Transactional
public DeviceDTO create(DeviceCreateDTO dto) {
    ensureSerialNumberAvailable(dto.getSerialNumber(), null);
    Device device = dtoMapper.toDevice(dto);
    return toDeviceDTOWithAvailability(deviceRepository.save(device));
}

    @Transactional
public DeviceDTO update(Integer id, DeviceUpdateDTO dto) {
    Device device = deviceRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new EntityNotFoundException("Device not found: " + id));
    if (dto.getSerialNumber() != null) {
        ensureSerialNumberAvailable(dto.getSerialNumber(), id);
    }
    if (dto.getRelayCount() != null && dto.getRelayCount() < device.getRelayCount()) {
        int highestAssignedRelay = doorRepository.findByDevice_IdAndDeletedAtIsNull(id).stream()
            .map(door -> door.getRelayIndex())
            .filter(relayIndex -> relayIndex != null)
            .max(Integer::compareTo)
            .orElse(0);
        if (highestAssignedRelay > dto.getRelayCount()) {
            throw new IllegalArgumentException("Relay count cannot be lower than an assigned door relay");
        }
    }
    dtoMapper.updateDeviceFromDTO(dto, device);
    return toDeviceDTOWithAvailability(deviceRepository.save(device));
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

    private DeviceDTO toDeviceDTOWithAvailability(Device device) {
        DeviceDTO dto = dtoMapper.toDeviceDTO(device);
        dto.setAvailableRelayIndices(calculateAvailableRelayIndices(device));
        return dto;
    }

    private List<Integer> calculateAvailableRelayIndices(Device device) {
        if (device.getId() == null || device.getRelayCount() == null || device.getRelayCount() <= 0) {
            return List.of();
        }

        Set<Integer> occupiedRelays = doorRepository.findByDevice_IdAndDeletedAtIsNull(device.getId()).stream()
            .map(door -> door.getRelayIndex())
            .filter(relayIndex -> relayIndex != null)
            .collect(Collectors.toSet());

        List<Integer> availableRelays = new ArrayList<>();
        for (int relayIndex = 1; relayIndex <= device.getRelayCount(); relayIndex++) {
            if (!occupiedRelays.contains(relayIndex)) {
                availableRelays.add(relayIndex);
            }
        }
        return availableRelays;
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
