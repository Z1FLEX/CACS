package com.hsware.cacs.web;

import com.hsware.cacs.entity.User;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.security.JwtService;
import com.hsware.cacs.security.TokenBlacklistService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMillis;

    @Value("${auth.refresh-cookie.secure:false}")
    private boolean secureRefreshCookie;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByEmailAndDeletedAtIsNull(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<String> roleNames = extractRoleNames(user);
            
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roleNames);
            String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail(), roleNames);

            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshToken, request).toString())
                .body(authResponse(accessToken, user, roleNames));
            
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Authentication failed",
                "message", "Invalid email or password"
            ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(
        @RequestBody(required = false) RefreshRequest refreshRequest,
        HttpServletRequest request
    ) {
        try {
            String refreshToken = Optional.ofNullable(readRefreshTokenCookie(request))
                .orElseGet(() -> refreshRequest != null ? refreshRequest.getRefreshToken() : null);
            
            if (refreshToken == null
                || tokenBlacklistService.isBlacklisted(refreshToken)
                || !jwtService.isTokenValid(refreshToken)
                || !jwtService.isRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Invalid token",
                    "message", "Refresh token is invalid or expired"
                ));
            }

            String email = jwtService.extractEmail(refreshToken);
            User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            List<String> roles = extractRoleNames(user);

            String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roles);

            return ResponseEntity.ok(authResponse(newAccessToken, user, roles));
            
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Token refresh failed",
                "message", "Unable to refresh access token"
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        try {
            final String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                if (jwtService.isTokenValid(token)) {
                    long remainingTime = jwtService.getRemainingExpirationTime(token);
                    if (remainingTime > 0) {
                        tokenBlacklistService.blacklistToken(token, remainingTime);
                    }
                }
                
                SecurityContextHolder.clearContext();
            }

            String refreshToken = readRefreshTokenCookie(request);
            if (refreshToken != null && jwtService.isTokenValid(refreshToken)) {
                long remainingTime = jwtService.getRemainingExpirationTime(refreshToken);
                if (remainingTime > 0) {
                    tokenBlacklistService.blacklistToken(refreshToken, remainingTime);
                }
            }
            
            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie(request).toString())
                .body(Map.of("message", "Logged out successfully"));
            
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Logout failed",
                "message", "Unable to process logout"
            ));
        }
    }

    private Map<String, Object> authResponse(String accessToken, User user, List<String> roleNames) {
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);

        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("email", user.getEmail());
        userResponse.put("roles", roleNames);
        response.put("user", userResponse);

        return response;
    }

    private List<String> extractRoleNames(User user) {
        return user.getRoles().stream()
            .map(role -> role.getName().toUpperCase())
            .distinct()
            .collect(Collectors.toList());
    }

    private String readRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie buildRefreshCookie(String refreshToken, HttpServletRequest request) {
        return baseRefreshCookie(request)
            .value(refreshToken)
            .maxAge(refreshTokenExpirationMillis / 1000)
            .build();
    }

    private ResponseCookie clearRefreshCookie(HttpServletRequest request) {
        return baseRefreshCookie(request)
            .value("")
            .maxAge(0)
            .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseRefreshCookie(HttpServletRequest request) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE)
            .httpOnly(true)
            .secure(secureRefreshCookie || request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto")))
            .sameSite("Strict")
            .path("/api/auth");
    }

    // DTO classes
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RefreshRequest {
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
}
