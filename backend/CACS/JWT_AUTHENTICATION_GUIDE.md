# JWT Authentication System Guide

## Overview

This document describes the complete JWT-based stateless authentication system implemented for the CACS (Controlled Access Control System) backend.

## Architecture

### Core Components

1. **JwtService** - Handles token generation, validation, and claims extraction
2. **UserPrincipal** - Custom UserDetails implementation wrapping User entity
3. **CustomUserDetailsService** - Loads users by email with status validation
4. **JwtAuthenticationFilter** - Processes JWT tokens in HTTP requests
5. **TokenBlacklistService** - Redis-based token blacklist for logout functionality
6. **AuthController** - REST endpoints for authentication operations

### Security Configuration

- **Stateless authentication** - No server-side sessions
- **Role-based authorization** - authorities derived from RBAC role assignments
- **JSON error responses** - Proper 401/403 error handling
- **CSRF disabled** - Suitable for REST API

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Authenticates user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "roles": ["ADMIN"]
  }
}
```

#### POST /api/auth/refresh
Refreshes access token using a valid refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/logout
Logs out user by blacklisting the current access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Protected Endpoints

All endpoints except `/api/auth/login` and `/api/auth/refresh` require authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

## Token Configuration

### Access Token
- **Expiration:** 15 minutes (900,000 milliseconds)
- **Claims:** userId, roles
- **Usage:** API requests

### Refresh Token
- **Expiration:** 7 days (604,800,000 milliseconds)
- **Claims:** userId, roles, type: "refresh"
- **Usage:** Token refresh only

## Role-Based Authorization

### Available Roles
- **ADMIN** - Full access to all operations
- **RESPONSABLE** - Limited access (read operations)
- **USER** - Basic access (future implementation)

### Endpoint Permissions

#### User Management (/api/users)
- **GET /api/users** - ADMIN, RESPONSABLE
- **GET /api/users/{id}** - ADMIN, RESPONSABLE
- **POST /api/users** - ADMIN only
- **PUT /api/users/{id}** - ADMIN only
- **DELETE /api/users/{id}** - ADMIN only

### Method Security Annotations

```java
@PreAuthorize("hasRole('ADMIN')")
// Only ADMIN users can access

@PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE')")
// Both ADMIN and RESPONSABLE users can access
```

## Database Integration

### User Entity Fields
- `email` - Unique identifier for authentication
- `password` - BCrypt encrypted password
- `status` - Account status (ACTIVE, INACTIVE)
- `deleted_at` - Soft deletion timestamp

### RBAC Tables
- `roles` - Role catalog managed independently from users
- `user_roles` - Role assignments for each user

### Authentication Rules
- Only users with `status = 'ACTIVE'` can authenticate
- Soft-deleted users (`deleted_at` not null) cannot authenticate
- Email must be unique and valid

## Redis Integration

### Token Blacklist
- **Key Pattern:** `blacklist:token:<token>`
- **TTL:** Matches remaining token expiration time
- **Purpose:** Prevents token reuse after logout

### Configuration
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

## Configuration

### JWT Settings
```yaml
jwt:
  secret: your-secret-key-here
  access-token-expiration: 900000  # 15 minutes
  refresh-token-expiration: 604800000  # 7 days
```

### Security Configuration
```yaml
spring:
  security:
    session:
      creation-policy: stateless
```

## Error Handling

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required: ...",
  "path": "/api/protected"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: ...",
  "path": "/api/protected"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.user;
};

// API Request with Token
const getUsers = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Token Refresh
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
};

// Logout
const logout = async () => {
  const token = localStorage.getItem('accessToken');
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

## Security Best Practices

1. **Token Storage:** Store tokens securely on client-side (httpOnly cookies recommended)
2. **HTTPS:** Always use HTTPS in production
3. **Token Rotation:** Implement token rotation for enhanced security
4. **Password Security:** Use strong password policies
5. **Rate Limiting:** Implement rate limiting on auth endpoints
6. **Monitoring:** Monitor authentication failures and suspicious activities

## Testing

The authentication system can be tested using:

1. **Unit Tests:** Test individual components
2. **Integration Tests:** Test complete authentication flow
3. **Manual Testing:** Use Postman or similar tools

### Test User Creation
```sql
INSERT INTO users (email, password, first_name, last_name, status, created_at)
VALUES ('test@example.com', '$2a$10$encryptedPassword', 'Test', 'User', 'ACTIVE', NOW());

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'test@example.com';
```

## Troubleshooting

### Common Issues

1. **Token Expired:** Refresh token using `/api/auth/refresh`
2. **Invalid Token:** Check token format and secret
3. **User Not Found:** Verify user exists and is active
4. **Redis Connection:** Check Redis server status
5. **Database Connection:** Verify database connectivity

### Logging

Enable debug logging for troubleshooting:
```yaml
logging:
  level:
    com.hsware.cacs.security: DEBUG
    org.springframework.security: DEBUG
```

## Migration from Mock Auth

To migrate from mock authentication:

1. Update frontend to use JWT endpoints
2. Replace mock auth calls with real API calls
3. Implement token storage and refresh logic
4. Update error handling for auth failures
5. Test all protected endpoints

## Future Enhancements

1. **Multi-factor Authentication**
2. **OAuth2 Integration**
3. **Token Revocation List**
4. **Session Management**
5. **Advanced Rate Limiting**
6. **Audit Logging**
