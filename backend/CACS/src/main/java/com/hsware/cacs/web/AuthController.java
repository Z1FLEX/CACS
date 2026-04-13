package com.hsware.cacs.web;

import com.hsware.cacs.entity.User;
import com.hsware.cacs.repository.UserRepository;
import com.hsware.cacs.security.JwtService;
import com.hsware.cacs.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get user details from database
            User user = userRepository.findByEmailAndDeletedAtIsNull(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName().toUpperCase())
                    .distinct()
                    .collect(Collectors.toList());
            
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roleNames);
            String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail(), roleNames);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("email", user.getEmail());
            userResponse.put("roles", roleNames);
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Authentication failed",
                "message", "Invalid email or password"
            ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody RefreshRequest refreshRequest) {
        try {
            String refreshToken = refreshRequest.getRefreshToken();
            
            if (!jwtService.isTokenValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Invalid token",
                    "message", "Refresh token is invalid or expired"
                ));
            }

            String email = jwtService.extractEmail(refreshToken);
            Integer userId = jwtService.extractUserId(refreshToken);
            List<String> roles = jwtService.extractRoles(refreshToken);

            String newAccessToken = jwtService.generateAccessToken(userId, email, roles);

            return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken
            ));
            
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
            
            return ResponseEntity.ok(Map.of(
                "message", "Logged out successfully"
            ));
            
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Logout failed",
                "message", "Unable to process logout"
            ));
        }
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
