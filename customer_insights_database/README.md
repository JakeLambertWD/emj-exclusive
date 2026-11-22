# Customer Insights Dashboard database pack

This pack accompanies the **three-hour Full Stack Developer Technical Assessment**. It supplies the PostgreSQL schema, synthetic records and data dictionary mentioned in the brief. The assessment requirements and time allowance are unchanged.

The fixed snapshot contains **250 customers, 12 staff members and 3,000 deals**. All values are fictional. Email addresses use `example.com`. Amounts are **GBP pounds**, and timestamp examples use **UTC**. No external accounts, API keys or production data are needed.

## Files

| File | Purpose |
| --- | --- |
| `sql/01_schema.sql` | The three tables, relationships, constraints and baseline indexes. |
| `sql/02_seed.sql` | The complete fixed dataset as SQL inserts. |
| `sql/03_verify.sql` | Read-only checks that the full set of supplied records has been imported. |
| `DATA_DICTIONARY.md` | Every column, allowed values, null handling and metric/filter definitions. |
| `data/customers.json`, `data/staff.json`, `data/deals.json` | The raw records for inspection and test fixtures. The application must retrieve its data from PostgreSQL. |
| `data/metadata.json` | Snapshot version, raw table counts, units, categories and date range. |
| `compose.yaml`, `.env.example` | An optional local database setup with persistent storage and a readiness check. |

## Quick start with Docker

Use Docker with Compose V2. From this directory, copy `.env.example` to `.env`, then start the database:

```sh
cp .env.example .env
docker compose up -d --wait
```

On Windows, copying the environment file in PowerShell is `Copy-Item .env.example .env`. Run the same Docker command afterwards.

The database listens on **localhost:55432** by default. The health check waits for PostgreSQL over TCP and verifies the seeded deal count. The provided Compose file starts the database only; add your own application service or run your application separately.

| Setting | Default |
| --- | --- |
| Database | `customer_insights` |
| User | `assessment` |
| Local development password | `assessment_local_only` |
| Host connection string | `postgresql://assessment:assessment_local_only@localhost:55432/customer_insights` |
| Connection string for an app in this Compose network | `postgresql://assessment:assessment_local_only@db:5432/customer_insights` |
| Container port | `5432` |
| Host port | `55432` |

These are local development defaults. If you change the database, user, password or port in `.env`, update your application's connection string too. Inside an application container on the same network, the database hostname is `db`; `localhost` refers to that application container itself.

Run the import checks:

```sh
docker compose exec -T db sh -c 'psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/03_verify.sql'
```

Open an interactive database session if useful:

```sh
docker compose exec db sh -c 'psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

## Using an existing local PostgreSQL instance

Use PostgreSQL **16 or later**, a dedicated empty database and a UTF-8 locale such as `C.UTF-8`. Set `DATABASE_URL` to that database's connection string, then run these files in order:

```sh
psql -X -v ON_ERROR_STOP=1 "$DATABASE_URL" -f sql/01_schema.sql
psql -X -v ON_ERROR_STOP=1 "$DATABASE_URL" -f sql/02_seed.sql
psql -X -v ON_ERROR_STOP=1 "$DATABASE_URL" -f sql/03_verify.sql
```

The database and database login must already exist. The scripts create application tables in `public`; they do not create accounts or databases. No extensions are required.

## Repeatability and resetting

The Docker image initialises the scripts in filename order on the first startup of an empty data volume. Later restarts reuse the existing data. To stop and start without resetting:

```sh
docker compose down
docker compose up -d --wait
```

Running the schema and seed files again against the unchanged supplied schema is also supported. Seed records with an existing ID are left unchanged; identity sequences are advanced to the maximum stored ID. The scripts do not delete rows, repair an edited dataset or migrate an unrelated schema. The verification script checks the raw table counts after import. Follow the calculation rules in the assessment brief and data dictionary, and test your application against those rules.

To restore the exact original snapshot, remove this Compose project's database volume and start again. **The following reset deletes this assessment database's local data:**

```sh
docker compose down -v
docker compose up -d --wait
```

If initialisation fails, inspect `docker compose logs db`, correct the problem and reset the local assessment volume. Editing an init SQL file does not cause it to run automatically on an existing volume.

## Working with the supplied data

Read `DATA_DICTIONARY.md` for the schema, allowed values and metric definitions. Use PostgreSQL as the application data source. The raw JSON files are provided for record inspection and your own test fixtures.

The dataset includes customers with no deals, incomplete deals, missing company or staff values, category ties, equal timestamps, duplicate display names and fractional amounts. Use cases like these to check your implementation.

Only primary-key and case-insensitive email uniqueness indexes are supplied. You may add indexes or supporting objects through documented migrations. No dashboard views, aggregate columns, backend endpoints or frontend implementation are supplied.

Authentication and customer access rules are discussion topics in the assessment. The `staff.role` and `deals.staff_id` fields do not define application permissions or a customer owner.

## Dataset version

This is a fixed synthetic snapshot. The ready-to-import SQL contains all supplied records. Preserve those records when completing the assessment; supporting database objects may be added through documented migrations as described in the brief.

The supplied Docker configuration uses PostgreSQL `16.16-bookworm`. The SQL uses features supported by PostgreSQL 16 or later.

## Technical references

- [PostgreSQL numeric types](https://www.postgresql.org/docs/16/datatype-numeric.html)
- [PostgreSQL date and time types](https://www.postgresql.org/docs/16/datatype-datetime.html)
- [Official PostgreSQL Docker image](https://hub.docker.com/_/postgres)

The original assessment brief is supplied separately. This pack provides its database contract and data without changing its requirements.
