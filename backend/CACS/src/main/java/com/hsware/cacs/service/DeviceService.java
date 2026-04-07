package com.hsware.cacs.service;

import com.hsware.cacs.dto.DeviceDTO;
import com.hsware.cacs.dto.DeviceCreateDTO;
import com.hsware.cacs.dto.DeviceUpdateDTO;
import com.hsware.cacs.entity.Device;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<DeviceDTO> findAll() {
        return deviceRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toDeviceDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<DeviceDTO> findById(Integer id) {
        return deviceRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toDeviceDTO);
    }

    @Transactional
public DeviceDTO create(DeviceCreateDTO dto) {
    Device device = dtoMapper.toDevice(dto);
    return dtoMapper.toDeviceDTO(deviceRepository.save(device));
}

    @Transactional
public DeviceDTO update(Integer id, DeviceUpdateDTO dto) {
    Device device = deviceRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new EntityNotFoundException("Device not found: " + id));
    dtoMapper.updateDeviceFromDTO(dto, device);
    return dtoMapper.toDeviceDTO(deviceRepository.save(device));
}

    @Transactional
    public boolean delete(Integer id) {
        Optional<Device> existing = deviceRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Device d = existing.get();
        d.setDeletedAt(java.time.Instant.now());
        deviceRepository.save(d);
        return true;
    }

}
