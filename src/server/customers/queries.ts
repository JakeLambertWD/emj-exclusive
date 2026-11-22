import { db } from "@/server/db";
import { sql } from "kysely";
import "server-only";

export type CustomerRow = {
  id: number;
  fullName: string;
  email: string;
  company: string | null;
  /** Money as an exact string, e.g. "1250.00" */
  totalSpend: string;
  totalDeals: number;
};

export async function getCustomers(): Promise<CustomerRow[]> {
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
      // Step 2: list customers and attach their totals
      .selectFrom("customers as c")
      // LEFT JOIN includes every customer even ones with no completed deals
      .leftJoin("customer_metrics as m", "m.customer_id", "c.id")
      .select([
        "c.id",
        "c.full_name as fullName",
        "c.email",
        "c.company",
        // Customers with no completed deals show £0.00 and 0 instead of nothing
        sql<string>`coalesce(m.total_spend, 0.00)`.as("totalSpend"),
        sql<number>`coalesce(m.total_deals, 0)`.as("totalDeals"),
      ])
      // Sort A to Z by name; id keeps customers with the same name in a fixed order
      .orderBy("c.full_name")
      .orderBy("c.id")
      // First page only
      .limit(25)
      .execute()
  );
}
