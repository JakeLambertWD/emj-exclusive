import { db } from "@/server/db";
import type { Filters } from "@/utils/filters";
import "server-only";

// The customers the table and the dashboard stats both describe.
// One shared query, so the table, its count and the stats can never disagree about who matches.
export function matchingCustomers({ category, staffId }: Filters) {
  return (
    db
      .selectFrom("customers as c")
      .select("c.id")
      // With no filter selected, every customer matches, including those with no deals
      .$if(category !== null || staffId !== null, (qb) =>
        qb.where((eb) =>
          // A customer matches when ONE completed deal satisfies every selected filter.
          // Checking category and staff in the same EXISTS means both must be on the same deal:
          // a Travel deal with Morgan and a Dining deal with Priya doesn't match "Travel + Priya"
          eb.exists(
            eb
              .selectFrom("deals as d")
              .select("d.id")
              .whereRef("d.customer_id", "=", "c.id")
              // Only completed deals qualify; pending and cancelled are ignored
              .where("d.status", "=", "completed")
              .$if(category !== null, (sub) => sub.where("d.product_category", "=", category!))
              .$if(staffId !== null, (sub) => sub.where("d.staff_id", "=", staffId!)),
          ),
        ),
      )
  );
}
