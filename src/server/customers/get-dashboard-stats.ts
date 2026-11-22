import { db } from "@/server/db";
import type { ProductCategory } from "@/server/db-types";
import type { Filters } from "@/utils/filters";
import { sql } from "kysely";
import "server-only";
import { matchingCustomers } from "./matching-customers";

export type DashboardStats = {
  totalCustomers: number;
  completedValue: string;
  completedDeals: number;
  averageSpend: string;
  mostPopularCategory: ProductCategory | null;
};

export async function getDashboardStats(filters: Filters): Promise<DashboardStats> {
  return (
    db
      // Step 1: the customers the dashboard is describing: the same ones the table lists, across every page
      .with("matching_customers", () => matchingCustomers(filters))
      // Step 2: every completed deal belonging to those customers, across their full history.
      // Not just deals in the selected category or with the selected staff member
      .with("completed_deals", (qb) =>
        qb
          .selectFrom("deals as d")
          .innerJoin("matching_customers as mc", "mc.id", "d.customer_id")
          .select(["d.product_category", "d.deal_value"])
          .where("d.status", "=", "completed"),
      )
      // Step 3: the category with the most completed deals; ties go to the alphabetically first
      .with("top_category", (qb) =>
        qb
          .selectFrom("completed_deals")
          .select("product_category")
          .groupBy("product_category")
          .orderBy(sql`count(*)`, "desc")
          .orderBy("product_category", "asc")
          .limit(1),
      )
      // Step 4: one row of totals. Each value is its own subquery, so nothing is multiplied by a join
      .selectNoFrom([
        sql<number>`(select count(*)::int from matching_customers)`.as("totalCustomers"),
        sql<string>`(select coalesce(sum(deal_value), 0.00) from completed_deals)`.as("completedValue"),
        sql<number>`(select count(*)::int from completed_deals)`.as("completedDeals"),
        // Divide by every matching customer, including those with zero spend.
        // NULLIF turns 0 customers into NULL so it can't divide by zero; COALESCE then gives 0
        sql<string>`coalesce(
          (select sum(deal_value) from completed_deals)
            / nullif((select count(*) from matching_customers), 0),
          0
        )::text`.as("averageSpend"),
        sql<ProductCategory | null>`(select product_category from top_category)`.as("mostPopularCategory"),
      ])
      .executeTakeFirstOrThrow()
  );
}
