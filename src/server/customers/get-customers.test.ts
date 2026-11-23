import {
  beginTestTransaction,
  closeTestDb,
  insertCustomer,
  insertDeal,
  insertStaff,
  rollbackTestTransaction,
} from "@/test/test-db";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type CustomerQuery, getCustomers } from "./get-customers";

// Run the real query code inside a rolled-back test transaction
vi.mock("@/server/db", () => import("@/test/test-db"));

beforeEach(beginTestTransaction);
afterEach(rollbackTestTransaction);
afterAll(closeTestDb);

// Everything on one page, sorted by name, no filters
const allCustomers: CustomerQuery = {
  page: 1,
  pageSize: 50,
  sort: "name",
  dir: "asc",
  category: null,
  staffId: null,
};

async function getCustomer(customerId: number, query: Partial<CustomerQuery> = {}) {
  const { customers } = await getCustomers({ ...allCustomers, ...query });
  return customers.find((customer) => customer.id === customerId);
}

describe("getCustomers", () => {
  it("counts only completed deals in spend, deal count, favourite category and last deal", async () => {
    const customerId = await insertCustomer("Avery Completed");
    await insertDeal({ customerId, value: "100.00", category: "Travel", createdAt: "2026-01-01T00:00:00Z" });
    await insertDeal({ customerId, value: "200.00", category: "Travel", createdAt: "2026-02-01T00:00:00Z" });
    // Newer, bigger and in another category, but not completed, so none of these may count
    await insertDeal({ customerId, value: "900.00", status: "pending", category: "Wellness", createdAt: "2026-06-01T00:00:00Z" });
    await insertDeal({ customerId, value: "50.00", status: "cancelled", category: "Wellness", createdAt: "2026-07-01T00:00:00Z" });
    await insertDeal({ customerId, value: "75.00", status: "pending", category: "Wellness", createdAt: "2026-08-01T00:00:00Z" });

    const customer = await getCustomer(customerId);

    expect(customer?.totalSpend).toBe("300.00");
    expect(customer?.totalDeals).toBe(2);
    expect(customer?.favouriteCategory).toBe("Travel");
    expect(customer?.lastDealAt?.toISOString()).toBe("2026-02-01T00:00:00.000Z");
  });

  it("shows zeros and empty values for customers with no completed deals", async () => {
    const onlyPendingId = await insertCustomer("Blake Pending");
    await insertDeal({ customerId: onlyPendingId, value: "500.00", status: "pending" });
    const noDealsId = await insertCustomer("Casey NoDeals");

    for (const customerId of [onlyPendingId, noDealsId]) {
      const customer = await getCustomer(customerId);

      // Still listed: no filters means every customer appears
      expect(customer).toBeDefined();
      expect(customer?.totalSpend).toBe("0.00");
      expect(customer?.totalDeals).toBe(0);
      expect(customer?.favouriteCategory).toBeNull();
      expect(customer?.staff).toEqual([]);
      expect(customer?.lastDealAt).toBeNull();
    }
  });

  it("breaks a favourite category tie alphabetically", async () => {
    const customerId = await insertCustomer("Drew Tie");
    // Two each of Travel, Wellness and Dining: Dining comes first alphabetically
    for (const category of ["Travel", "Wellness", "Dining"] as const) {
      await insertDeal({ customerId, value: "10.00", category });
      await insertDeal({ customerId, value: "10.00", category });
    }

    const customer = await getCustomer(customerId);

    expect(customer?.favouriteCategory).toBe("Dining");
  });

  it("lists each staff member once and doesn't double count deals when joining staff", async () => {
    const priya = await insertStaff("Priya Shah");
    const morgan = await insertStaff("Morgan Ellis");
    const customerId = await insertCustomer("Eden Staff");
    await insertDeal({ customerId, value: "100.00", staffId: priya });
    await insertDeal({ customerId, value: "100.00", staffId: priya });
    await insertDeal({ customerId, value: "100.00", staffId: morgan });
    // No staff recorded: still counts towards spend, adds no one to the list
    await insertDeal({ customerId, value: "100.00", staffId: null });

    const customer = await getCustomer(customerId);

    expect(customer?.staff.map((member) => member.name)).toEqual(["Morgan Ellis", "Priya Shah"]);
    expect(customer?.totalSpend).toBe("400.00");
    expect(customer?.totalDeals).toBe(4);
  });

  it("filters choose customers by a single completed deal matching every selected filter", async () => {
    const priya = await insertStaff("Priya Shah");
    const morgan = await insertStaff("Morgan Ellis");
    // Travel with Morgan and Dining with Priya: no single deal is Travel AND Priya
    const alex = await insertCustomer("Alex Filter");
    await insertDeal({ customerId: alex, value: "100.00", category: "Travel", staffId: morgan });
    await insertDeal({ customerId: alex, value: "100.00", category: "Dining", staffId: priya });
    // One deal is Travel AND Priya
    const blair = await insertCustomer("Blair Filter");
    await insertDeal({ customerId: blair, value: "100.00", category: "Travel", staffId: priya });
    await insertDeal({ customerId: blair, value: "250.00", category: "Events", staffId: morgan });
    // Travel with Priya, but only pending, so it doesn't qualify
    const pending = await insertCustomer("Pat Pending");
    await insertDeal({ customerId: pending, value: "100.00", category: "Travel", staffId: priya, status: "pending" });

    const { customers, totalCount } = await getCustomers({ ...allCustomers, category: "Travel", staffId: priya });

    expect(customers.map((customer) => customer.fullName)).toEqual(["Blair Filter"]);
    expect(totalCount).toBe(1);
    // The filter picks Blair; their metrics still cover every completed deal, not just Travel
    expect(customers[0].totalSpend).toBe("350.00");
    expect(customers[0].totalDeals).toBe(2);
  });

  it("pages through customers with equal sort values without skipping or repeating any", async () => {
    // Same name and same spend for all five: only the id tie-breaker keeps the order fixed
    const ids: number[] = [];
    for (let index = 0; index < 5; index += 1) {
      const customerId = await insertCustomer("Sam Same");
      await insertDeal({ customerId, value: "100.00" });
      ids.push(customerId);
    }

    for (const sort of ["name", "spend"] as const) {
      const seen: number[] = [];
      for (const page of [1, 2, 3]) {
        const { customers } = await getCustomers({ ...allCustomers, sort, dir: "desc", page, pageSize: 2 });
        seen.push(...customers.map((customer) => customer.id));
      }

      expect(seen).toEqual(ids);
    }
  });

  it("keeps customers with no completed deal last when sorting by last deal, in both directions", async () => {
    const older = await insertCustomer("Older Deal");
    await insertDeal({ customerId: older, value: "10.00", createdAt: "2026-01-01T00:00:00Z" });
    const newer = await insertCustomer("Newer Deal");
    await insertDeal({ customerId: newer, value: "10.00", createdAt: "2026-05-01T00:00:00Z" });
    const none = await insertCustomer("No Deal");

    const ascending = await getCustomers({ ...allCustomers, sort: "lastDeal", dir: "asc" });
    const descending = await getCustomers({ ...allCustomers, sort: "lastDeal", dir: "desc" });

    expect(ascending.customers.map((customer) => customer.id)).toEqual([older, newer, none]);
    expect(descending.customers.map((customer) => customer.id)).toEqual([newer, older, none]);
  });
});
