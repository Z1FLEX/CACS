package com.hsware.cacs.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "12345678901234567890123456789012");
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 900000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 604800000L);
    }

    @Test
    void generateAccessTokenStoresNormalizedRolesClaim() {
        String token = jwtService.generateAccessToken(
            7,
            "admin@cacs.com",
            List.of("admin", "RESPONSABLE", "admin")
        );

        assertThat(jwtService.extractUserId(token)).isEqualTo(7);
        assertThat(jwtService.extractEmail(token)).isEqualTo("admin@cacs.com");
        assertThat(jwtService.extractRoles(token)).containsExactly("ADMIN", "RESPONSABLE");
        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isFalse();
    }

    @Test
    void generateRefreshTokenMarksTokenTypeAndPreservesRoles() {
        String token = jwtService.generateRefreshToken(
            9,
            "manager@cacs.com",
            List.of("responsable")
        );

        assertThat(jwtService.extractRoles(token)).containsExactly("RESPONSABLE");
        assertThat(jwtService.extractTokenType(token)).isEqualTo("refresh");
        assertThat(jwtService.isRefreshToken(token)).isTrue();
    }
}
