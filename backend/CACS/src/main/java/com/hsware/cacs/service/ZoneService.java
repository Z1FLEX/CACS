package com.hsware.cacs.service;

import com.hsware.cacs.dto.ZoneDTO;
import com.hsware.cacs.dto.ZoneCreateDTO;
import com.hsware.cacs.dto.ZoneUpdateDTO;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.mapper.DtoMapper;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final DoorRepository doorRepository;
    private final DeviceRepository deviceRepository;
    private final ProfileRepository profileRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<ZoneDTO> findAll() {
        List<Zone> zones = zoneRepository.findByDeletedAtIsNull();
        Map<Integer, String> managerDisplayByZoneId = loadManagerDisplayByZoneId(zones);

        return zones.stream()
                .map(zone -> dtoMapper.toZoneDTO(zone, managerDisplayByZoneId.get(zone.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ZoneDTO> findById(Integer id) {
        return zoneRepository.findByIdAndDeletedAtIsNull(id)
            .map(zone -> dtoMapper.toZoneDTO(zone, loadManagerDisplayByZoneId(List.of(zone)).get(zone.getId())));
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

    private Map<Integer, String> loadManagerDisplayByZoneId(List<Zone> zones) {
        Set<Integer> zoneIds = zones.stream()
            .map(Zone::getId)
            .filter(id -> id != null)
            .collect(Collectors.toSet());
        if (zoneIds.isEmpty()) {
            return Map.of();
        }

        return userRepository.findManagersByResponsibleZoneIds(zoneIds).stream()
            .flatMap(user -> user.getResponsibleZones().stream()
                .filter(zone -> zone.getId() != null && zoneIds.contains(zone.getId()))
                .map(zone -> Map.entry(zone.getId(), displayName(user))))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (first, ignored) -> first));
    }

    private String displayName(User user) {
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
            + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return name.isEmpty() ? user.getEmail() : name;
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Zone> existing = zoneRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        if (doorRepository.existsByZone_IdAndDeletedAtIsNull(id)) {
            throw new IllegalArgumentException("Cannot delete a zone that is still assigned to doors");
        }
        if (deviceRepository.existsByZone_IdAndDeletedAtIsNull(id)) {
            throw new IllegalArgumentException("Cannot delete a zone that is still assigned to devices");
        }
        if (profileRepository.countByZones_IdAndDeletedAtIsNull(id) > 0) {
            throw new IllegalArgumentException("Cannot delete a zone that is still assigned to profiles");
        }
        Zone z = existing.get();
        z.setDeletedAt(java.time.Instant.now());
        zoneRepository.save(z);
        return true;
    }

}
