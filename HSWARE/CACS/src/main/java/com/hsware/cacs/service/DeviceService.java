package com.hsware.cacs.service;

import com.hsware.cacs.entity.Device;
import com.hsware.cacs.entity.Door;
import com.hsware.cacs.repository.DeviceRepository;
import com.hsware.cacs.repository.DoorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import static java.util.Map.entry;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DoorRepository doorRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return deviceRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return deviceRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Device d = toEntity(body, null);
        d = deviceRepository.save(d);
        return toMap(d);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<Device> existing = deviceRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Device d = existing.get();
        applyBodyToDevice(body, d);
        d = deviceRepository.save(d);
        return Optional.of(toMap(d));
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



    public Map<String, Object> toMap(Device d) {
        Door door = d.getDoor();
        return Map.ofEntries(
                entry("id", d.getId()),
                entry("serialNumber", nullToEmpty(d.getSerialNumber())),
                entry("modelName", nullToEmpty(d.getModelName())),
                entry("type", d.getType() != null ? d.getType() : 0),
                entry("name", nullToEmpty(d.getSerialNumber())),
                entry("doorId", door != null ? door.getId() : 0),
                entry("doorName", door != null ? nullToEmpty(door.getName()) : ""),
                entry("status", nullToEmpty(d.getStatus())),
                entry("ip", nullToEmpty(d.getIp())),
                entry("port", d.getPort() != null ? d.getPort() : 0),
                entry("lastSeenAt", d.getLastSeenAt() != null ? d.getLastSeenAt().toString() : "")
        );
    }
    private Device toEntity(Map<String, Object> body, Integer id) {
        Device d = new Device();
        if (id != null) d.setId(id);
        applyBodyToDevice(body, d);
        return d;
    }

    private void applyBodyToDevice(Map<String, Object> body, Device d) {
        String sn = getStr(body, "serialNumber");
        if (sn.isEmpty()) sn = getStr(body, "name");
        d.setSerialNumber(sn);
        d.setModelName(getStr(body, "modelName"));
        Object t = body.get("type");
        d.setType(t != null ? ((Number) t).intValue() : null);
        String st = getStr(body, "status").toUpperCase();
        d.setStatus(st.isEmpty() ? "ONLINE" : st);
        d.setIp(getStr(body, "ip"));
        Object port = body.get("port");
        d.setPort(port != null ? ((Number) port).intValue() : null);
        String doorId = getStr(body, "doorId");
        if (!doorId.isEmpty()) {
            try {
                doorRepository.findById(Integer.parseInt(doorId)).ifPresent(d::setDoor);
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
