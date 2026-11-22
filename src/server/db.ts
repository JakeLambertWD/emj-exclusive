import "server-only";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./db-types";

// Reuse one pool and Kysely instance across hot reloads in development
const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
  db?: Kysely<Database>;
};

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

export const db =
  globalForDb.db ?? new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
  globalForDb.db = db;
}
