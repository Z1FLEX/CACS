# SCAS

SCAS is a full-stack access control application with:

- Spring Boot backend
- React + TypeScript frontend
- PostgreSQL database
- Redis for token blacklist / auth support
- Docker Compose setup for one-command startup

## Project Specifications
**[View/Download Cahier des Charges (PDF)](./docs/Cahier_des_Charges_CACS.pdf)**

## Project Structure

- `HSWARE/CACS` - Spring Boot backend
- `React-Shadcn-Admin-Dashboard` - React frontend
- `docker-compose.yml` - root Docker Compose entrypoint

## Prerequisites

Install:

- Docker
- Docker Compose

## Quick Start

1. Clone or extract the project.
2. Open a terminal in the project root:

```bash
cd CACS
```

3. Create a real `.env` file from `.env.example`.
4. Fill in the required values.
5. Start the app:

```bash
docker compose up --build
```




## Useful Commands

Start:

```bash
docker compose up --build
```

Start in background:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

Rebuild everything:

```bash
docker compose down
docker compose up --build --force-recreate
```

See logs:

```bash
docker compose logs -f
```




## Notes

- PostgreSQL data is persisted in the Docker volume `cacs_postgres_data`
- Redis data is persisted in the Docker volume `cacs_redis_data`
- The backend uses Redis for caching and token blacklist behavior
- The backend uses Flyway migrations on startup

