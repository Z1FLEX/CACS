package com.hsware.cacs.service;

import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.repository.AccessCardRepository;
import com.hsware.cacs.repository.ProfileRepository;
import com.hsware.cacs.repository.UserRepository;
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
public class UserService {

    private final UserRepository userRepository;
    private final AccessCardRepository accessCardRepository;
    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return userRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return userRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        User u = toEntity(body, null);
        if (u.getPassword() == null || u.getPassword().isEmpty()) {
            u.setPassword("CHANGE_ME");
        }
        u = userRepository.save(u);
        return toMap(u);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<User> existing = userRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        User u = existing.get();
        applyBodyToUser(body, u);
        u = userRepository.save(u);
        return Optional.of(toMap(u));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<User> existing = userRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        User u = existing.get();
        u.setDeletedAt(java.time.Instant.now());
        u.setStatus("INACTIVE");
        userRepository.save(u);
        return true;
    }

    public Map<String, Object> toMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        String name = (nullToEmpty(u.getFirstName()) + " " + nullToEmpty(u.getLastName())).trim();
        m.put("name", name.isEmpty() ? nullToEmpty(u.getEmail()) : name);
        m.put("firstName", nullToEmpty(u.getFirstName()));
        m.put("lastName", nullToEmpty(u.getLastName()));
        m.put("email", nullToEmpty(u.getEmail()));
        m.put("role", nullToEmpty(u.getRole()));
        m.put("status", nullToEmpty(u.getStatus()));
        m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString().split("T")[0] : "");
        m.put("cardId", u.getAccessCard() != null ? u.getAccessCard().getId() : null);
        m.put("profileId", u.getProfile() != null ? u.getProfile().getId() : null);
        m.put("address", nullToEmpty(u.getAddress()));
        return m;
    }

    private User toEntity(Map<String, Object> body, Integer id) {
        User u = new User();
        if (id != null) u.setId(id);
        applyBodyToUser(body, u);
        String pw = getStr(body, "password");
        if (!pw.isEmpty()) u.setPassword(pw);
        String createdAt = getStr(body, "createdAt");
        if (!createdAt.isEmpty()) {
            try {
                u.setCreatedAt(java.time.Instant.parse(createdAt + "T00:00:00Z"));
            } catch (Exception ignored) {}
        }
        return u;
    }

    private void applyBodyToUser(Map<String, Object> body, User u) {
        String first = getStr(body, "firstName");
        String last = getStr(body, "lastName");
        String name = getStr(body, "name");
        if (!name.isEmpty() && first.isEmpty() && last.isEmpty()) {
            String[] parts = name.split(" ", 2);
            u.setFirstName(parts[0]);
            u.setLastName(parts.length > 1 ? parts[1] : null);
        } else {
            u.setFirstName(first);
            u.setLastName(last);
        }
        u.setEmail(getStr(body, "email"));
        u.setRole(getStr(body, "role").toUpperCase());
        String st = getStr(body, "status").toUpperCase();
        u.setStatus(st.isEmpty() ? "ACTIVE" : st);
        u.setAddress(getStr(body, "address"));
        String cardId = getStr(body, "cardId");
        if (!cardId.isEmpty()) {
            try {
                accessCardRepository.findById(Integer.parseInt(cardId)).ifPresent(u::setAccessCard);
            } catch (NumberFormatException ignored) {}
        } else {
            u.setAccessCard(null);
        }
        String profileId = getStr(body, "profileId");
        if (!profileId.isEmpty()) {
            try {
                profileRepository.findById(Integer.parseInt(profileId)).ifPresent(u::setProfile);
            } catch (NumberFormatException ignored) {}
        } else {
            u.setProfile(null);
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
