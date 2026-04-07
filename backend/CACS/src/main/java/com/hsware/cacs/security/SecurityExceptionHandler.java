package com.hsware.cacs.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityExceptionHandler {

    @Component
    public static class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

        @Override
        public void commence(HttpServletRequest request, HttpServletResponse response,
                           AuthenticationException authException) throws IOException {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = String.format(
                "{\"status\":%d,\"error\":\"Unauthorized\",\"message\":\"Authentication required: %s\",\"path\":\"%s\"}",
                HttpServletResponse.SC_UNAUTHORIZED,
                authException.getMessage() != null ? authException.getMessage() : "No authentication provided",
                request.getRequestURI()
            );

            response.getWriter().write(jsonResponse);
        }
    }

    @Component
    public static class CustomAccessDeniedHandler implements AccessDeniedHandler {

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response,
                         AccessDeniedException accessDeniedException) throws IOException {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = String.format(
                "{\"status\":%d,\"error\":\"Forbidden\",\"message\":\"Access denied: %s\",\"path\":\"%s\"}",
                HttpServletResponse.SC_FORBIDDEN,
                accessDeniedException.getMessage() != null ? accessDeniedException.getMessage() : "Access denied",
                request.getRequestURI()
            );

            response.getWriter().write(jsonResponse);
        }
    }
}
