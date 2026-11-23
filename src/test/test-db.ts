import type { Database, DealStatus, ProductCategory } from "@/server/db-types";
import { type ControlledTransaction, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

// Stands in for "@/server/db" in tests (see vi.mock in each test file).
// Every query the real code sends goes into the current test's transaction,
// which is rolled back afterwards, so the seeded assessment data is never changed.

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and start the database: docker compose up db");
}

const rootDb = new Kysely<Database>({
  dialect: new PostgresDialect({ pool: new Pool({ connectionString: process.env.DATABASE_URL, max: 2 }) }),
});

let transaction: ControlledTransaction<Database> | null = null;

// Looks like the app's `db`, but forwards every call to the open test transaction
export const db = new Proxy({} as Kysely<Database>, {
  get(_target, property) {
    if (!transaction) throw new Error("No test transaction open. Call beginTestTransaction() in beforeEach.");
    const value = Reflect.get(transaction, property, transaction);
    // Bind methods to the real transaction, which uses private fields a proxy can't reach
    return typeof value === "function" ? value.bind(transaction) : value;
  },
});

// Opens a transaction and empties the tables inside it, so each test sees only its own fixtures.
// Nothing is really deleted: rollbackTestTransaction() undoes it all.
export async function beginTestTransaction() {
  transaction = await rootDb.startTransaction().execute();
  await transaction.deleteFrom("deals").execute();
  await transaction.deleteFrom("customers").execute();
  await transaction.deleteFrom("staff").execute();
}

export async function rollbackTestTransaction() {
  await transaction?.rollback().execute();
  transaction = null;
}

export async function closeTestDb() {
  await rootDb.destroy();
}

let fixtureCount = 0;

// Small fixture builders. Each returns the new row's id

export async function insertStaff(fullName: string): Promise<number> {
  fixtureCount += 1;
  const { id } = await db
    .insertInto("staff")
    .values({ full_name: fullName, email: `staff-${fixtureCount}@test.example`, role: "Concierge Manager" })
    .returning("id")
    .executeTakeFirstOrThrow();
  return id;
}

export async function insertCustomer(fullName: string, company: string | null = null): Promise<number> {
  fixtureCount += 1;
  // Emails must be unique, so each fixture gets its own
  const { id } = await db
    .insertInto("customers")
    .values({ full_name: fullName, email: `customer-${fixtureCount}@test.example`, company })
    .returning("id")
    .executeTakeFirstOrThrow();
  return id;
}

type DealFixture = {
  customerId: number;
  value: string;
  status?: DealStatus;
  category?: ProductCategory;
  staffId?: number | null;
  createdAt?: string;
};

export async function insertDeal({
  customerId,
  value,
  status = "completed",
  category = "Travel",
  staffId = null,
  createdAt = "2026-01-01T00:00:00Z",
}: DealFixture): Promise<number> {
  const { id } = await db
    .insertInto("deals")
    .values({
      customer_id: customerId,
      deal_value: value,
      status,
      product_category: category,
      staff_id: staffId,
      created_at: createdAt,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return id;
}
