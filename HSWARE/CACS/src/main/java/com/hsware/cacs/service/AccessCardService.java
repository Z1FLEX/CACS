package com.hsware.cacs.service;

import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.entity.User;
import com.hsware.cacs.repository.AccessCardRepository;
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
public class AccessCardService {

    private final AccessCardRepository accessCardRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAll() {
        return accessCardRepository.findByDeletedAtIsNull().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> findById(Integer id) {
        return accessCardRepository.findByIdAndDeletedAtIsNull(id).map(this::toMap);
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        AccessCard c = toEntity(body, null);
        c = accessCardRepository.save(c);
        assignCardToUserIfRequested(c.getId(), body);
        return toMap(c);
    }

    @Transactional
    public Optional<Map<String, Object>> update(Integer id, Map<String, Object> body) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return Optional.empty();
        AccessCard c = existing.get();
        applyBodyToCard(body, c);
        c = accessCardRepository.save(c);
        assignCardToUserIfRequested(id, body);
        return Optional.of(toMap(c));
    }

    @Transactional
    public boolean delete(Integer id) {
        Optional<AccessCard> existing = accessCardRepository.findByIdAndDeletedAtIsNull(id);
        if (existing.isEmpty()) return false;
        AccessCard c = existing.get();
        c.setDeletedAt(java.time.Instant.now());
        c.setStatus("INACTIVE");
        accessCardRepository.save(c);
        return true;
    }

    private void assignCardToUserIfRequested(Integer cardId, Map<String, Object> body) {
        Object uid = body.get("userId");
        if (uid == null) return;
        String userIdStr = uid.toString().trim();
        if (userIdStr.isEmpty()) return;
        try {
            int userId = Integer.parseInt(userIdStr);
            userRepository.findById(userId).ifPresent(user -> {
                user.setAccessCard(accessCardRepository.findById(cardId).orElse(null));
                userRepository.save(user);
            });
        } catch (NumberFormatException ignored) {}
    }

    public Map<String, Object> toMap(AccessCard c) {
        Optional<User> userOpt = userRepository.findByAccessCard_Id(c.getId());
        String userId = userOpt.map(u -> String.valueOf(u.getId())).orElse("");
        String userName = userOpt.map(u -> (u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "")).map(String::trim).orElse("Unassigned");
        if (userName.isEmpty()) userName = "Unassigned";
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("uid", nullToEmpty(c.getUid()));
        m.put("cardNumber", nullToEmpty(c.getUid()));
        m.put("num", nullToEmpty(c.getNum()));
        m.put("status", nullToEmpty(c.getStatus()));
        m.put("userId", userId);
        m.put("userName", userName);
        return m;
    }

    private AccessCard toEntity(Map<String, Object> body, Integer id) {
        AccessCard c = new AccessCard();
        if (id != null) c.setId(id);
        applyBodyToCard(body, c);
        return c;
    }

    private void applyBodyToCard(Map<String, Object> body, AccessCard c) {
        String uid = getStr(body, "uid");
        if (uid.isEmpty()) uid = getStr(body, "cardNumber");
        c.setUid(uid);
        c.setNum(getStr(body, "num"));
        String st = getStr(body, "status").toUpperCase();
        c.setStatus(st.isEmpty() ? "ACTIVE" : st);
    }

    private static String getStr(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString().trim() : "";
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}
