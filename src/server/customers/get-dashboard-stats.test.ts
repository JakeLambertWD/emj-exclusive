import { formatGbp } from "@/utils/format";
import {
  beginTestTransaction,
  closeTestDb,
  insertCustomer,
  insertDeal,
  insertStaff,
  rollbackTestTransaction,
} from "@/test/test-db";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardStats } from "./get-dashboard-stats";

// Run the real query code inside a rolled-back test transaction
vi.mock("@/server/db", () => import("@/test/test-db"));

beforeEach(beginTestTransaction);
afterEach(rollbackTestTransaction);
afterAll(closeTestDb);

const noFilters = { category: null, staffId: null };

describe("getDashboardStats", () => {
  it("matches the brief's reference calculation", async () => {
    // Customer A: completed £100 and £200, pending £900. Customer B: no deals
    const customerA = await insertCustomer("Customer A");
    await insertDeal({ customerId: customerA, value: "100.00" });
    await insertDeal({ customerId: customerA, value: "200.00" });
    await insertDeal({ customerId: customerA, value: "900.00", status: "pending" });
    await insertCustomer("Customer B");

    const stats = await getDashboardStats(noFilters);

    expect(stats.totalCustomers).toBe(2);
    expect(stats.completedValue).toBe("300.00");
    expect(stats.completedDeals).toBe(2);
    // Divided by both customers, including B with zero spend: £300 / 2, not £300 / 1
    expect(formatGbp(stats.averageSpend)).toBe("£150.00");
  });

  it("rounds the average to the penny only when displayed, with halves rounded up", async () => {
    // £100.01 over 2 customers is exactly £50.005
    const customerId = await insertCustomer("Half Penny");
    await insertDeal({ customerId, value: "100.01" });
    await insertCustomer("Zero Spend");

    const stats = await getDashboardStats(noFilters);

    expect(Number(stats.averageSpend)).toBe(50.005);
    expect(formatGbp(stats.averageSpend)).toBe("£50.01");
  });

  it("breaks a most popular category tie alphabetically", async () => {
    const customerId = await insertCustomer("Tie Customer");
    await insertDeal({ customerId, value: "10.00", category: "Wellness" });
    await insertDeal({ customerId, value: "10.00", category: "Events" });
    await insertDeal({ customerId, value: "10.00", category: "Wellness" });
    await insertDeal({ customerId, value: "10.00", category: "Events" });

    const stats = await getDashboardStats(noFilters);

    expect(stats.mostPopularCategory).toBe("Events");
  });

  it("shows zeros and no category when nothing matches", async () => {
    const customerId = await insertCustomer("Only Pending");
    await insertDeal({ customerId, value: "500.00", status: "pending" });

    const noCompleted = await getDashboardStats(noFilters);
    expect(noCompleted).toEqual({
      totalCustomers: 1,
      completedValue: "0.00",
      completedDeals: 0,
      averageSpend: "0",
      mostPopularCategory: null,
    });

    // A filter nothing matches: no customers, and no divide-by-zero
    const noCustomers = await getDashboardStats({ category: "Travel", staffId: null });
    expect(noCustomers.totalCustomers).toBe(0);
    expect(formatGbp(noCustomers.averageSpend)).toBe("£0.00");
  });

  it("totals the full completed history of the customers a filter selects", async () => {
    const priya = await insertStaff("Priya Shah");
    const travelCustomer = await insertCustomer("Travel Customer");
    await insertDeal({ customerId: travelCustomer, value: "100.00", category: "Travel", staffId: priya });
    await insertDeal({ customerId: travelCustomer, value: "300.00", category: "Dining" });
    const diningOnly = await insertCustomer("Dining Only");
    await insertDeal({ customerId: diningOnly, value: "999.00", category: "Dining" });

    const stats = await getDashboardStats({ category: "Travel", staffId: null });

    // Only the Travel customer matches, but both of their deals count
    expect(stats.totalCustomers).toBe(1);
    expect(stats.completedValue).toBe("400.00");
    expect(stats.completedDeals).toBe(2);
  });
});
