package com.hsware.cacs.service;

import com.hsware.cacs.dto.ZoneDTO;
import com.hsware.cacs.dto.ZoneCreateDTO;
import com.hsware.cacs.dto.ZoneUpdateDTO;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.entity.ZoneType;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.ZoneRepository;
import com.hsware.cacs.repository.ZoneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<ZoneDTO> findAll() {
        return zoneRepository.findByDeletedAtIsNull().stream()
                .map(dtoMapper::toZoneDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ZoneDTO> findById(Integer id) {
        return zoneRepository.findByIdAndDeletedAtIsNull(id).map(dtoMapper::toZoneDTO);
    }

    @Transactional
    public ZoneDTO create(ZoneCreateDTO zoneCreateDTO) {
        Zone zone = dtoMapper.toZone(zoneCreateDTO);
        zone = zoneRepository.save(zone);
        return dtoMapper.toZoneDTO(zone);
    }

    @Transactional
    public Optional<ZoneDTO> update(Integer id, ZoneUpdateDTO zoneUpdateDTO) {
        Optional<Zone> existing = zoneRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Zone zone = existing.get();
        dtoMapper.updateZoneFromDTO(zoneUpdateDTO, zone);
        zone = zoneRepository.save(zone);
        return Optional.of(dtoMapper.toZoneDTO(zone));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Zone> existing = zoneRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Zone z = existing.get();
        z.setDeletedAt(java.time.Instant.now());
        zoneRepository.save(z);
        return true;
    }

}
