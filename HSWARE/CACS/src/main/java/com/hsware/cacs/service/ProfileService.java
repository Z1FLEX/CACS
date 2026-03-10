package com.hsware.cacs.service;

import com.hsware.cacs.entity.Profile;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.ScheduleRepository;
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
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return profileRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return profileRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        Profile p = toEntity(body, null);
        p = profileRepository.save(p);
        return toMap(p);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<Profile> existing = profileRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        Profile p = existing.get();
        applyBodyToProfile(body, p);
        p = profileRepository.save(p);
        return Optional.of(toMap(p));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<Profile> existing = profileRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        Profile p = existing.get();
        p.setDeletedAt(java.time.Instant.now());
        profileRepository.save(p);
        return true;
    }

    public Map<String, Object> toMap(Profile p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", nullToEmpty(p.getName()));
        m.put("scheduleId", p.getSchedule() != null ? p.getSchedule().getId() : null);
        m.put("description", "");
        m.put("permissions", 0);
        return m;
    }

    private Profile toEntity(Map<String, Object> body, Integer id) {
        Profile p = new Profile();
        if (id != null) p.setId(id);
        applyBodyToProfile(body, p);
        return p;
    }

    private void applyBodyToProfile(Map<String, Object> body, Profile p) {
        p.setName(getStr(body, "name"));
        Object sid = body.get("scheduleId");
        if (sid != null) {
            try {
                int scheduleId = sid instanceof Number ? ((Number) sid).intValue() : Integer.parseInt(sid.toString());
                scheduleRepository.findById(scheduleId).ifPresent(p::setSchedule);
            } catch (NumberFormatException ignored) {}
        } else {
            p.setSchedule(null);
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
