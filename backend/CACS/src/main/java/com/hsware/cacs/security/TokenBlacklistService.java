package com.hsware.cacs.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String BLACKLIST_PREFIX = "blacklist:token:";

    public void blacklistToken(String token, long ttlMillis) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, "true", ttlMillis, TimeUnit.MILLISECONDS);
        log.debug("Token blacklisted: {} with TTL: {}ms", token.substring(0, Math.min(10, token.length())) + "...", ttlMillis);
    }

    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    public void removeToken(String token) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.delete(key);
        log.debug("Token removed from blacklist: {}", token.substring(0, Math.min(10, token.length())) + "...");
    }
}
