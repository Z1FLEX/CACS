# Production HTTPS Rollout

This project is already structured around an Nginx frontend container, which makes it the right place to terminate TLS in production.

## Target architecture

- Nginx terminates public HTTP/HTTPS traffic.
- Nginx proxies `/api` and Swagger traffic to the Spring Boot backend over the internal Docker network.
- Spring Boot remains internal-only and trusts forwarded headers from Nginx.
- PostgreSQL and Redis remain internal-only in production.

## Incremental rollout plan

1. Establish production deployment foundations.
2. Add TLS listeners and HTTP to HTTPS redirects in Nginx.
3. Mount real certificates and define the renewal workflow.
4. Add transport hardening such as HSTS and final deployment documentation.

## Step 1 delivered here

- Added a production Compose override so only the frontend is exposed publicly.
- Switched the frontend Nginx config to runtime templating for environment-specific hostnames.
- Configured Spring Boot to respect proxy-forwarded headers.

## How to run the production shape for this step

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

At this stage, traffic is still plain HTTP on port 80. HTTPS certificate wiring comes in the next step.
