# CACS Backend – Setup & Deployment

## Stack (from spec)

- **Backend**: Spring Boot 4, REST API, JWT (to be wired), validation, OpenAPI
- **Database**: PostgreSQL, migrations via Flyway
- **Cache**: Redis (for profiles/zones/access rules later)
- **Deployment**: run as standalone JAR or deploy WAR to WildFly

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+ (running, database `scas_db` created)
- Redis (optional for now; disable in config if not used)

## Database

1. Create database and user:

```sql
CREATE USER scas WITH PASSWORD 'password';
CREATE DATABASE scas_db OWNER scas;
```

2. Migrations run on startup (Flyway). Current migrations:

- **V1**: Legacy tables (if present).
- **V2**: Spec schema: enums (as VARCHAR), `photo`, `zone_type`, `zone`, `schedule`, `schedule_day`, `day_time_slot`, `profile`, `profile_zone`, `access_card`, `users`, `zone_responsibility`, `door`, `device`, `access_log`, `admin_audit_log`, indexes, seed zone types.

## Run locally (embedded server)

```bash
./mvnw spring-boot:run
```

API: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Build WAR for WildFly

1. Build (use `wildfly` profile so embedded Tomcat is not packaged):

```bash
./mvnw clean package -Pwildfly -DskipTests
```

2. Output: `target/cacs.war`.

3. Deploy to WildFly:

- Copy `cacs.war` to `WILDFLY_HOME/standalone/deployments/`
- Or use WildFly CLI / Admin Console to deploy.

4. Default context root: `/cacs`. API base: `http://localhost:8080/cacs/api/...`

5. If the frontend uses a different base URL, set `VITE_API_BASE_URL=http://localhost:8080/cacs` (no trailing slash).

## Configuration

- `src/main/resources/application.yml`: datasource (PostgreSQL), JPA, Flyway, Redis, JWT placeholders.
- Override via env or `application-{profile}.yml` (e.g. `spring.profiles.active=prod`).

## CRUD endpoints (spec alignment)

| Resource      | Path                    | List | Get | Create | Update | Delete (soft) |
|---------------|-------------------------|------|-----|--------|--------|----------------|
| Users         | `/api/users`            | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Access cards  | `/api/access-cards`     | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Zones         | `/api/zones`            | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Doors         | `/api/doors`            | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Devices       | `/api/devices`          | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Profiles      | `/api/profiles`         | GET  | GET /:id | POST | PUT /:id | DELETE /:id |
| Schedules     | `/api/schedules`        | GET  | GET /:id | POST | PUT /:id | DELETE /:id |

All use integer IDs and soft delete (`deleted_at`) where applicable. CORS is enabled for the frontend origin.

## Next steps (when moving beyond CRUD)

- Authentication: JWT login, refresh, revocation (spec: 15 min access, 7 days refresh).
- RBAC: restrict endpoints by role assignments from `roles` and `user_roles`.
- Access control service: evaluate card + user + zone + schedule for AUTHORIZED/DENIED.
- Access log and admin audit log write/read APIs.
- Redis cache for profiles and zone rules.
- HTTPS/TLS and security hardening.
