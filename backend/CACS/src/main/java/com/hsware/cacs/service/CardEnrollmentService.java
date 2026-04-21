package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardEnrollmentStatusDTO;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class CardEnrollmentService {

    private static final String ENROLLMENT_ACTIVE_KEY = "access_card:enrollment:active";
    private static final String ENROLLMENT_UID_KEY = "access_card:enrollment:captured:uid";
    private static final String ENROLLMENT_CAPTURED_AT_KEY = "access_card:enrollment:captured:at";
    private static final Duration ENROLLMENT_TTL = Duration.ofSeconds(60);

    private final StringRedisTemplate redisTemplate;

    public CardEnrollmentService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public AccessCardEnrollmentStatusDTO armEnrollmentMode() {
        redisTemplate.opsForValue().set(ENROLLMENT_ACTIVE_KEY, "true", ENROLLMENT_TTL);
        redisTemplate.delete(ENROLLMENT_UID_KEY);
        redisTemplate.delete(ENROLLMENT_CAPTURED_AT_KEY);
        return getEnrollmentStatus();
    }

    public boolean isEnrollmentActive() {
        Boolean hasKey = redisTemplate.hasKey(ENROLLMENT_ACTIVE_KEY);
        return Boolean.TRUE.equals(hasKey);
    }

    public AccessCardEnrollmentStatusDTO captureEnrollmentUid(String rawUid) {
        if (!isEnrollmentActive()) {
            return getEnrollmentStatus();
        }

        redisTemplate.opsForValue().set(ENROLLMENT_UID_KEY, rawUid.trim(), ENROLLMENT_TTL);
        redisTemplate.opsForValue().set(ENROLLMENT_CAPTURED_AT_KEY, Instant.now().toString(), ENROLLMENT_TTL);
        return getEnrollmentStatus();
    }

    public AccessCardEnrollmentStatusDTO getEnrollmentStatus() {
        Long expiresInSeconds = redisTemplate.getExpire(ENROLLMENT_ACTIVE_KEY);
        String capturedUid = redisTemplate.opsForValue().get(ENROLLMENT_UID_KEY);
        String capturedAtRaw = redisTemplate.opsForValue().get(ENROLLMENT_CAPTURED_AT_KEY);

        Instant capturedAt = null;
        if (capturedAtRaw != null && !capturedAtRaw.isBlank()) {
            capturedAt = Instant.parse(capturedAtRaw);
        }

        return new AccessCardEnrollmentStatusDTO(
            isEnrollmentActive(),
            capturedUid,
            expiresInSeconds != null && expiresInSeconds >= 0 ? expiresInSeconds : 0L,
            capturedAt
        );
    }

    public void clearEnrollmentMode() {
        redisTemplate.delete(ENROLLMENT_ACTIVE_KEY);
        redisTemplate.delete(ENROLLMENT_UID_KEY);
        redisTemplate.delete(ENROLLMENT_CAPTURED_AT_KEY);
    }
}
