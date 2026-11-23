# EMJ Exclusive: Customer Insights Dashboard

A read-only dashboard of customers and their completed deals, built for the Full Stack Developer technical assessment.

Next.js 16 (App Router, server components), TypeScript, Mantine 9, Kysely on PostgreSQL 16, Docker Compose, Vitest.

## Prerequisites

- Docker Desktop (Docker Engine with Compose v2)
- Node.js 24 and npm, only for running the tests or the app outside Docker

No paid services or production credentials are needed.

## Run it

```bash
cp .env.example .env
docker compose up --build
```

- App: http://localhost:3000
- Health check: http://localhost:3000/api/health returns `{"ok":true}` once the database is reachable

On first start, Postgres runs the supplied scripts in `customer_insights_database/sql/` (schema, seed, verify) in filename order. They only run when the database volume is empty, so restarting never duplicates records. The app waits for the database healthcheck, which only passes once all 3,000 seeded deals are present, not merely when the container has started. Data is kept in a named volume between restarts.

### Reset the database

```bash
docker compose down -v   # removes the database volume
docker compose up --build
```

### Run locally with hot reload

```bash
npm install
docker compose up db     # database only, on localhost:55432
npm run dev              # http://localhost:3000, uses DATABASE_URL from .env
```

## Tests

```bash
docker compose up db     # the tests query the real database
npm install
npm test
```

16 tests in 3 files. Each data-access test runs the real query functions inside a transaction, clears the tables inside it, inserts a few fixture rows and rolls back afterwards, so the seeded data is never changed.

- [`get-customers.test.ts`](src/server/customers/get-customers.test.ts): completed vs pending and cancelled deals, customers with no completed deals, favourite category ties, distinct staff without double counting, filters matching on a single deal, stable pagination with equal sort values, missing last deals sorted last
- [`get-dashboard-stats.test.ts`](src/server/customers/get-dashboard-stats.test.ts): the brief's reference example (2 customers, £300, 2 deals, £150 average), rounding only at display, category ties, zero results, filters keeping full history
- [`params.test.ts`](src/server/customers/params.test.ts): invalid, repeated and SQL-like URL params fall back to safe defaults

Not covered by automated tests: React components and browser behaviour (URL updates, loading, empty and error states, keyboard use). I checked these by hand in Chrome.

## Versions

- Node.js 24 (`node:24-alpine`), declared in `package.json` `engines`
- PostgreSQL 16.16 (`postgres:16.16-bookworm`, UTC, `C.UTF-8` locale), matching the supplied database pack
- Next.js 16.4.6, React 19.3, Mantine 9, Kysely 0.29, zod 4, Vitest 5
- Dependencies pinned by `package-lock.json`

## Project structure

```
customer_insights_database/      Supplied schema, seed, verify SQL, data dictionary and JSON (unchanged)
src/server/                      Server only: database connection, queries and URL validation
  customers/matching-customers   Which customers match the filters, shared by the table and the stats
  customers/get-customers        Table rows: metrics, sorting and pagination
  customers/get-dashboard-stats  Summary statistics
  customers/params               zod schema for the URL
src/app/_components/features/    StatCards, CustomerFilters and CustomerTable sections
src/utils/                       Formatting and shared constants
src/test/                        Test database helpers
```

All search, filtering, sorting and pagination happen in PostgreSQL. The browser only receives the current page.

## Written answers

### 1. How a customer's total spend reaches the screen

The `customer_metrics` CTE in [`get-customers.ts`](src/server/customers/get-customers.ts#L73-L87) sums `deal_value` for deals whose status is exactly `completed`, grouped by customer. Customers are `LEFT JOIN`ed to it, so those without completed deals stay listed, and [`COALESCE(total_spend, 0.00)`](src/server/customers/get-customers.ts#L164) turns their null into £0.00. Every other CTE has at most one row per customer, so the joins can't multiply the sum. `pg` returns `numeric` as a string such as `"692912.06"`, and it stays a string in `CustomerRow.totalSpend`, so it is never rounded as a float. [`CustomerTable`](src/app/_components/features/CustomerTable/CustomerTable.tsx#L68), a server component, renders it with [`formatGbp`](src/utils/format.ts#L9), which passes the string straight to `Intl.NumberFormat('en-GB', GBP)` to display £692,912.06.

Verified by [`counts only completed deals…`](src/server/customers/get-customers.test.ts#L35), which inserts £100 and £200 completed deals plus pending and cancelled ones and expects `"300.00"` and 2 deals.

### 2. A significant technical decision

I kept all table state in the URL and rendered it with server components, rather than fetching from the client with tRPC and TanStack Query, which I've used most. The server validates the search params with zod, queries with Kysely and renders the result; the controls only call `router.replace` inside `useTransition`.

I chose this because there's no API layer to build within the time budget, every view has a shareable URL, and filtering, sorting and paging happen in PostgreSQL by design. Each change is a navigation, so React shows the latest one, and a slow earlier filter request can't overwrite a newer selection.

The limitation is that there's no client cache: going back to an earlier page re-runs its queries, and the stats re-run on every page change even though paging doesn't affect them.

## Performance notes

- Two queries per view, the page and the stats, plus a count and the staff list. There are no per-row queries: every metric is aggregated in SQL.
- At this size (3,000 deals) every query is a few milliseconds. With 100 times more data I would measure first with `EXPLAIN (ANALYZE, BUFFERS)` on the page and stats queries.
- Likely first change: partial indexes on `deals (customer_id) WHERE status = 'completed'` for the per-customer aggregates, and `deals (product_category, staff_id, customer_id) WHERE status = 'completed'` for the filters. The supplied schema only indexes emails.
- Search with a leading wildcard (`ILIKE '%term%'`) can't use a B-tree index. At scale the `pg_trgm` extension with GIN indexes is the usual fix.
- `OFFSET` pagination slows down on deep pages. Keyset pagination would fix it but makes arbitrary page jumps harder.

## Time, priorities and unfinished work

**Time spent:** about [X hours] in total, including setup, testing and documentation.

**Priorities:** correct SQL first, checked against an independent calculation from the supplied JSON for all 250 customers, then the table and dashboard, server-side validation, the UI states and the tests.

**Unfinished** (I ran out of time for these):

- **Search** by name, email and company. The groundwork is in place:
  - the URL schema already accepts and validates `q` (trimmed, capped at 100 characters)
  - the condition would go in the shared [`matchingCustomers`](src/server/customers/matching-customers.ts) query, so the table, its count and the stats would stay consistent automatically
  - plan: `full_name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1` with `%term%`, escaping `%`, `_` and `\` so they match literally, plus a labelled, debounced (300 ms) input that writes `q` to the URL and resets to page 1
- **Index migration.** Plan: add `migrations/04_indexes.sql`, mounted into `/docker-entrypoint-initdb.d` after the supplied scripts so their files stay unchanged, containing the two partial indexes in the performance notes above.
- **Customer detail view** (optional): not attempted.

## Behaviour notes

- "Completed" means the exact status `completed`. Pending and cancelled deals are excluded from every figure.
- Filters choose which customers appear. Each row and the stats still use those customers' full completed history.
- Category and staff filters must match the same completed deal.
- Average customer spend divides by every matching customer, including those with no spend, and is rounded half up to the penny only for display.
- Dates are deal creation dates, shown in UTC.
- Ties: favourite and most popular category go alphabetically, last deal goes to the higher deal id, and table sorts fall back to customer id. Missing last deals sort last in both directions.
- A page past the end shows the last page. Invalid URL values fall back to defaults instead of erroring.
- Database errors show a generic message with a Try again button and a reference that matches the server log; details and stack traces stay on the server.

## Use of AI

I used Claude (Anthropic) through the Claude app, connected to this repository, throughout the build.

- **What it helped with:** Docker Compose and the database healthcheck, the Kysely queries, components, the zod schema, the test setup and drafting this README.
- **How I checked the results:**
  - compared every column and statistic against an independent calculation from the supplied JSON, for all 250 customers and every filter combination
  - paged through every sort order to confirm no customer was skipped or repeated
  - triggered the loading, empty and error states in a browser
  - broke the code on purpose (counting pending deals, reversing ties, averaging over buyers only, splitting the filters across deals) to confirm the tests fail
  - reviewed the code myself and reorganised the folder structure and naming to my own conventions
