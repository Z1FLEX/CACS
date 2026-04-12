# SCAS

SCAS is a full-stack access control application with:

- Spring Boot backend
- React + TypeScript frontend
- PostgreSQL database
- Redis for token blacklist / auth support
- Fully containerized with Docker

## Project Specifications

**[View/Download Cahier des Charges (PDF)](./docs/Cahier_des_Charges_CACS.pdf)**

## Project Structure

- `HSWARE/CACS` — Spring Boot backend
- `React-Shadcn-Admin-Dashboard` — React frontend
- `docker-compose.yml` — base Docker Compose config
- `docker-compose.prod.yml` — production overlay (HTTPS)
- `infra/tls/` — local TLS certificates (committed, generated with mkcert)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## Quick Start (Local HTTPS)

> Steps 2 and 3 are one-time only.

1. Clone the project and open a terminal in the project root:

```bash
cd CACS
```

2. Create your local env file:

```bash
cp .env.local.example .env.local
```

3. Install the local CA so your browser trusts `https://localhost`:

```bash
chmod +x setup-local-https.sh
./setup-local-https.sh
```

> Restart your browser after this step.

4. Start the stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.local up --build
```

5. Open **[https://localhost](https://localhost)**

---

## Useful Commands

**Start (HTTP only, dev mode):**
```bash
docker compose up --build
```

**Start in background:**
```bash
docker compose up -d --build
```

**Stop:**
```bash
docker compose down
```

**Stop and wipe volumes (fresh DB):**
```bash
docker compose down -v
```

**Rebuild everything from scratch:**
```bash
docker compose down
docker compose up --build --force-recreate
```

**Follow logs:**
```bash
docker compose logs -f
```

**Local HTTPS startup:**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.local up --build
```

**Issue a production certificate (first time):**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile certbot run --rm certbot \
  certonly --webroot --webroot-path /var/www/certbot \
  --email your-email@example.com --agree-tos --no-eff-email \
  -d example.com
```

---

## Notes

- PostgreSQL data is persisted in Docker volume `cacs_postgres_data`
- Redis data is persisted in Docker volume `cacs_redis_data`
- The backend uses Redis for caching and token blacklist behavior
- The backend uses Flyway migrations on startup
- For production deployment, certificate layout, and hardening checklist see `docs/production-https.md`