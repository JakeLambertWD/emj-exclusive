import { db } from "@/server/db";
import type { ProductCategory } from "@/server/db-types";
import type { Pagination } from "@/utils/pagination";
import type { Sort } from "@/utils/sorting";
import { sql } from "kysely";
import "server-only";

export type StaffMember = {
  id: number;
  name: string;
};

export type CustomerRow = {
  id: number;
  fullName: string;
  email: string;
  company: string | null;
  totalSpend: string;
  totalDeals: number;
  favouriteCategory: ProductCategory | null;
  staff: StaffMember[];
  lastDealAt: Date | null;
};

export type CustomerPage = {
  customers: CustomerRow[];
  /** How many customers there are in total, across every page */
  totalCount: number;
  /** The page actually shown: a page past the end is moved back to the last page */
  page: number;
};

export type CustomerQuery = Pagination & Sort;

export async function getCustomers({ page, pageSize, sort, dir }: CustomerQuery): Promise<CustomerPage> {
  // Count first, so a page past the end (e.g. ?page=99) can be moved back to the last real page
  const totalCount = await countCustomers();
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, lastPage);

  const customers = await getCustomerRows({ page: currentPage, pageSize, sort, dir });

  return { customers, totalCount, page: currentPage };
}

// How many customers match, across every page
async function countCustomers(): Promise<number> {
  const { count } = await db
    .selectFrom("customers")
    .select(sql<number>`count(*)::int`.as("count"))
    .executeTakeFirstOrThrow();

  return count;
}

// Each sort key maps to one fixed SQL expression. Only these strings ever reach ORDER BY,
// so the URL can choose a column but can never inject SQL
const SORT_COLUMNS = {
  name: sql`c.full_name`,
  spend: sql`coalesce(m.total_spend, 0)`,
  deals: sql`coalesce(m.total_deals, 0)`,
  lastDeal: sql`ld.created_at`,
} as const;

async function getCustomerRows({ page, pageSize, sort, dir }: CustomerQuery): Promise<CustomerRow[]> {
  return (
    db
      // Step 1: total up each customer's completed deals
      .with("customer_metrics", (qb) =>
        qb
          .selectFrom("deals")
          .select([
            // Group by customer to get one row per customer
            "customer_id",
            // Sum is an SQL function that adds the deal values for a given customer
            sql<string>`sum(deal_value)`.as("total_spend"),
            // Count is an SQL function that counts the number of rows for a given customer
            sql<number>`count(*)::int`.as("total_deals"),
          ])
          // Only completed deals count; pending and cancelled are ignored
          .where("status", "=", "completed")
          // One row per customer
          .groupBy("customer_id"),
      )
      // Step 2: count each customer's completed deals per category
      .with("category_counts", (qb) =>
        qb
          .selectFrom("deals")
          .select(["customer_id", "product_category", sql<number>`count(*)::int`.as("deal_count")])
          .where("status", "=", "completed")
          .groupBy(["customer_id", "product_category"]),
      )
      // Step 3: keep each customer's top category
      .with("favourite_category", (qb) =>
        qb
          .selectFrom("category_counts")
          // DISTINCT ON keeps only the first row per customer, in the order below
          .distinctOn("customer_id")
          .select(["customer_id", "product_category"])
          .orderBy("customer_id")
          // Most completed deals first...
          .orderBy("deal_count", "desc")
          // ...and on a tie, the alphabetically first category (column uses C collation)
          .orderBy("product_category", "asc"),
      )
      // Step 4: the distinct staff linked to each customer's completed deals
      .with("customer_staff", (qb) =>
        qb
          .selectFrom(
            // One row per customer and staff member, however many deals they share,
            // so a staff member is never listed twice
            db
              .selectFrom("deals")
              .select(["customer_id", "staff_id"])
              .distinct()
              .where("status", "=", "completed")
              // Deals with no staff recorded still count towards spend, but list no one
              .where("staff_id", "is not", null)
              .as("cs"),
          )
          .innerJoin("staff as s", "s.id", "cs.staff_id")
          .select([
            "cs.customer_id",
            // Build a JSON list of { id, name }, sorted by name; staff are identified by id
            sql<StaffMember[]>`json_agg(json_build_object('id', s.id, 'name', s.full_name) ORDER BY s.full_name, s.id)`.as(
              "staff",
            ),
          ])
          .groupBy("cs.customer_id"),
      )
      // Step 5: the creation time of each customer's latest completed deal
      .with("last_deal", (qb) =>
        qb
          .selectFrom("deals")
          .distinctOn("customer_id")
          .select(["customer_id", "created_at"])
          .where("status", "=", "completed")
          .orderBy("customer_id")
          // Newest first; on an identical timestamp the higher deal id wins
          .orderBy("created_at", "desc")
          .orderBy("id", "desc"),
      )
      // Step 6: list customers and attach everything above.
      // Each CTE has at most one row per customer, so these joins can't double count.
      .selectFrom("customers as c")
      // LEFT JOIN includes every customer even ones with no completed deals
      .leftJoin("customer_metrics as m", "m.customer_id", "c.id")
      .leftJoin("favourite_category as fc", "fc.customer_id", "c.id")
      .leftJoin("customer_staff as cst", "cst.customer_id", "c.id")
      .leftJoin("last_deal as ld", "ld.customer_id", "c.id")
      .select([
        "c.id",
        "c.full_name as fullName",
        "c.email",
        "c.company",
        // Customers with no completed deals show £0.00 and 0 instead of nothing
        sql<string>`coalesce(m.total_spend, 0.00)`.as("totalSpend"),
        sql<number>`coalesce(m.total_deals, 0)`.as("totalDeals"),
        "fc.product_category as favouriteCategory",
        // An empty list rather than null when no staff are linked
        sql<StaffMember[]>`coalesce(cst.staff, '[]'::json)`.as("staff"),
        "ld.created_at as lastDealAt",
      ])
      // Sort by the chosen column. NULLS LAST keeps customers with no completed deal at the
      // bottom when sorting by last deal, in both directions (Postgres puts nulls first for desc)
      .orderBy(SORT_COLUMNS[sort], (ob) => (dir === "asc" ? ob.asc() : ob.desc()).nullsLast())
      // Ties (same name, same spend, same date) are ordered by id, so the order is always fixed.
      // That fixed order is what makes paging reliable: no customer is skipped or repeated
      .orderBy("c.id")
      // Only the rows for the requested page, e.g. page 2 of 25 skips 25 and takes the next 25.
      // Kysely sends both numbers as query parameters ($1, $2), never pasted into the SQL
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
  );
}
