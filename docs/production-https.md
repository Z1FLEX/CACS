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

## Step 2 delivered here

- Split frontend Nginx into dedicated HTTP and HTTPS templates.
- Added an HTTP to HTTPS redirect in the production template.
- Exposed port 443 in the production Compose override.
- Added explicit environment variables for the TLS certificate and key paths, with default in-container locations under `/etc/nginx/tls`.

The production stack is now TLS-aware, but it still needs certificate files to be mounted before it can boot successfully in HTTPS mode.

## Step 3 delivered here

- Added a bind-mounted certificate directory for the frontend container.
- Mounted the full Let's Encrypt state directory so renewal metadata is preserved.
- Added a shared ACME challenge volume between Nginx and Certbot.
- Added a production-only `certbot` service profile for certificate issuance and renewal jobs.
- Exposed `/.well-known/acme-challenge/` through Nginx so HTTP-01 validation can work without weakening the HTTPS redirect strategy.

## Production certificate layout

- Host Let's Encrypt directory: `${TLS_LETSENCRYPT_DIR}`
- Mounted inside Nginx and Certbot as: `/etc/letsencrypt`
- Frontend certificate file paths are configured explicitly through:
  - `${TLS_CERTIFICATE_PATH}`
  - `${TLS_CERTIFICATE_KEY_PATH}`

The default local path is `./infra/letsencrypt`, which is intentionally gitignored.

## Example issuance flow

Start the production stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend backend postgres redis
```

Request a certificate with Certbot using the shared webroot:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile certbot run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d example.com
```

After issuance, point `TLS_CERTIFICATE_PATH` and `TLS_CERTIFICATE_KEY_PATH` at the generated lineage, then restart the frontend:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart frontend
```

## Renewal shape

Renewal can use the same profile:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile certbot run --rm certbot renew
```

You should follow renewal with a frontend reload or restart so Nginx picks up the new certificate files.
