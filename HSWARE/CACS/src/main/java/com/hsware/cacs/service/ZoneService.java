package com.hsware.cacs.service;

import com.hsware.cacs.entity.Zone;
import com.hsware.cacs.entity.ZoneType;
import com.hsware.cacs.repository.ZoneRepository;
import com.hsware.cacs.repository.ZoneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final ZoneTypeRepository zoneTypeRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return zoneRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return zoneRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Zone z = toEntity(body, null);
        z = zoneRepository.save(z);
        return toMap(z);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<Zone> existing = zoneRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Zone z = existing.get();
        applyBodyToZone(body, z);
        z = zoneRepository.save(z);
        return Optional.of(toMap(z));
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

    public Map<String, Object> toMap(Zone z) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", z.getId());
        m.put("name", nullToEmpty(z.getName()));
        m.put("location", nullToEmpty(z.getLocation()));
        if (z.getZoneType() != null) {
            ZoneType t = z.getZoneType();
            m.put("zoneTypeId", t.getId());
            m.put("zoneType", Map.of("id", t.getId(), "name", nullToEmpty(t.getName()), "level", t.getSecurityLevel() != null ? t.getSecurityLevel() : 0));
        } else {
            m.put("zoneTypeId", null);
            m.put("zoneType", Map.of("name", "", "level", 0));
        }
        m.put("deletedAt", z.getDeletedAt() != null ? z.getDeletedAt().toString() : null);
        return m;
    }

    private Zone toEntity(Map<String, Object> body, Integer id) {
        Zone z = new Zone();
        if (id != null) z.setId(id);
        applyBodyToZone(body, z);
        return z;
    }

    private void applyBodyToZone(Map<String, Object> body, Zone z) {
        z.setName(getStr(body, "name"));
        z.setLocation(getStr(body, "location"));
        Object ztid = body.get("zoneTypeId");
        if (ztid != null) {
            try {
                int tid = ztid instanceof Number ? ((Number) ztid).intValue() : Integer.parseInt(ztid.toString());
                zoneTypeRepository.findById(tid).ifPresent(z::setZoneType);
            } catch (NumberFormatException ignored) {}
        }
        Object zt = body.get("zoneType");
        if (zt instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> ztMap = (Map<String, Object>) zt;
            String name = getStr(ztMap, "name");
            if (!name.isEmpty()) {
                zoneTypeRepository.findByDeletedAtIsNull().stream()
                        .filter(t -> name.equals(t.getName()))
                        .findFirst()
                        .ifPresent(z::setZoneType);
            }
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
