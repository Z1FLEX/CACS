package com.hsware.cacs.service;

import com.hsware.cacs.dto.ZoneDTO;
import com.hsware.cacs.dto.ZoneCreateDTO;
import com.hsware.cacs.dto.ZoneUpdateDTO;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
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
        if (zoneCreateDTO.getResponsibleUserId() != null) {
            applyZoneResponsibility(zone, zoneCreateDTO.getResponsibleUserId());
        }
        return dtoMapper.toZoneDTO(zoneRepository.findByIdAndDeletedAtIsNull(zone.getId()).orElse(zone));
    }

    @Transactional
    public Optional<ZoneDTO> update(Integer id, ZoneUpdateDTO zoneUpdateDTO) {
        Optional<Zone> existing = zoneRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Zone zone = existing.get();
        dtoMapper.updateZoneFromDTO(zoneUpdateDTO, zone);
        zone = zoneRepository.save(zone);
        if (zoneUpdateDTO.getResponsibleUserId() != null) {
            applyZoneResponsibility(zone, zoneUpdateDTO.getResponsibleUserId());
        }
        return Optional.of(dtoMapper.toZoneDTO(zoneRepository.findByIdAndDeletedAtIsNull(zone.getId()).orElse(zone)));
    }

    /**
     * Single-manager model: clears existing zone_responsibility rows for this zone, then optionally assigns one user.
     *
     * @param responsibleUserId 0 to clear only; positive to set that user as manager
     */
    private void applyZoneResponsibility(Zone zone, Integer responsibleUserId) {
        Objects.requireNonNull(zone.getId(), "zone id");
        List<User> current = userRepository.findByResponsibleZones_IdAndDeletedAtIsNull(zone.getId());
        for (User u : current) {
            u.getResponsibleZones().remove(zone);
            userRepository.save(u);
        }
        if (responsibleUserId != null && responsibleUserId > 0) {
            userRepository.findByIdAndDeletedAtIsNull(responsibleUserId).ifPresent(newManager -> {
                newManager.getResponsibleZones().add(zone);
                userRepository.save(newManager);
            });
        }
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
