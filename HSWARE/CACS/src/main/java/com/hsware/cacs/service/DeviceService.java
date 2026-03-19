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
    public DeviceDTO create(DeviceCreateDTO deviceCreateDTO) {
        Device device = dtoMapper.toDevice(deviceCreateDTO);
        device = deviceRepository.save(device);
        return dtoMapper.toDeviceDTO(device);
    }

    @Transactional
    public Optional<DeviceDTO> update(Integer id, DeviceUpdateDTO deviceUpdateDTO) {
        Optional<Device> existing = deviceRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Device device = existing.get();
        dtoMapper.updateDeviceFromDTO(deviceUpdateDTO, device);
        device = deviceRepository.save(device);
        return Optional.of(dtoMapper.toDeviceDTO(device));
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
