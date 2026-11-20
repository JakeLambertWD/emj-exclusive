# EMJ Exclusive: Customer Insights Dashboard

Read-only dashboard of customers and completed deals. Next.js 16 (App Router), TypeScript, Mantine 9, PostgreSQL 17, Docker Compose.

## Prerequisites

- Docker Desktop (Docker Engine with Compose v2)
- Node.js 24 LTS and npm, only for running outside Docker

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

- App: http://localhost:3000
- Health check (confirms the database is reachable): http://localhost:3000/api/health

On first start, Postgres runs the SQL files in `db/init/` in alphabetical order. They only run when the database volume is empty, so restarts do not duplicate seeded records. The app container waits until Postgres passes its healthcheck, which only passes once initialisation has finished.

### Reset the local database

```bash
docker compose down -v   # removes the database volume
docker compose up --build
```

## Run locally with hot reload

```bash
npm install
docker compose up db     # database only
npm run dev              # uses DATABASE_URL from .env (localhost:5432)
```

## Tests

```bash
npm test
```

## Versions

- Node.js 24 (`node:24-alpine` image)
- PostgreSQL 17 (`postgres:17` image)
- Dependencies pinned by `package-lock.json`

## Project structure

```
db/init/        Schema and seed SQL, run once on an empty volume
src/server/     Database pool, queries and business rules (server only)
src/app/        Pages and route handlers (presentation)
```
