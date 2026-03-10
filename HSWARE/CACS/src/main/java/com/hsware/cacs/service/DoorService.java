package com.hsware.cacs.service;

import com.hsware.cacs.entity.Door;
import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.repository.DoorRepository;
import com.hsware.cacs.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoorService {

    private final DoorRepository doorRepository;
    private final ZoneRepository zoneRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return doorRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return doorRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Door d = toEntity(body, null);
        d = doorRepository.save(d);
        return toMap(d);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<Door> existing = doorRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Door d = existing.get();
        applyBodyToDoor(body, d);
        d = doorRepository.save(d);
        return Optional.of(toMap(d));
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

    public Map<String, Object> toMap(Door d) {
        Zone zone = d.getZone();
        return Map.of(
                "id", d.getId(),
                "name", nullToEmpty(d.getName()),
                "zoneId", zone != null ? zone.getId() : 0,
                "zoneName", zone != null ? nullToEmpty(zone.getName()) : ""
        );
    }

    private Door toEntity(Map<String, Object> body, Integer id) {
        Door d = new Door();
        if (id != null) d.setId(id);
        applyBodyToDoor(body, d);
        return d;
    }

    private void applyBodyToDoor(Map<String, Object> body, Door d) {
        d.setName(getStr(body, "name"));
        String zoneId = getStr(body, "zoneId");
        if (!zoneId.isEmpty()) {
            try {
                zoneRepository.findById(Integer.parseInt(zoneId)).ifPresent(d::setZone);
            } catch (NumberFormatException ignored) {}
        }
    }

    private static String getStr(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString().trim() : "";
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}
