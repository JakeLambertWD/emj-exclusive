# EMJ Exclusive: Customer Insights Dashboard

Read-only dashboard of customers and completed deals. Next.js 16 (App Router), TypeScript, Mantine 9, PostgreSQL 16, Docker Compose.

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

On first start, Postgres runs the supplied scripts in `customer_insights_database/sql/` (schema, seed, verify) in filename order. They only run when the database volume is empty, so restarts do not duplicate seeded records. The app container waits for the database healthcheck, which only passes once all 3,000 seeded deals are present.

The database is also reachable from your machine at `localhost:55432` (see `.env.example`).

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
- PostgreSQL 16.16 (`postgres:16.16-bookworm` image, UTC, `C.UTF-8` locale), matching the supplied database pack
- Dependencies pinned by `package-lock.json`

## Project structure

```
customer_insights_database/   Supplied schema, seed, verify SQL, data dictionary and raw JSON (unchanged)
src/server/     Database pool, queries and business rules (server only)
src/app/        Pages and route handlers (presentation)
```
