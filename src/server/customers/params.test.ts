import { describe, expect, it } from "vitest";
import { parseCustomerParams } from "./params";

const defaults = {
  q: "",
  category: null,
  staffId: null,
  sort: "name",
  dir: "asc",
  page: 1,
  pageSize: 25,
};

describe("parseCustomerParams", () => {
  it("falls back to defaults for the brief's invalid URL", () => {
    const params = parseCustomerParams({
      sort: "drop",
      dir: "sideways",
      page: "-5",
      pageSize: "9999",
      category: "travel",
    });

    expect(params).toEqual(defaults);
  });

  it("keeps valid values", () => {
    const params = parseCustomerParams({
      q: "  wong  ",
      category: "Travel",
      staffId: "7",
      sort: "spend",
      dir: "desc",
      page: "3",
      pageSize: "50",
    });

    expect(params).toEqual({ q: "wong", category: "Travel", staffId: 7, sort: "spend", dir: "desc", page: 3, pageSize: 50 });
  });

  it("uses the first value when a param repeats", () => {
    const params = parseCustomerParams({ category: ["Dining", "Travel"], page: ["2", "9"] });

    expect(params.category).toBe("Dining");
    expect(params.page).toBe(2);
  });

  it("rejects values that only look like numbers or SQL", () => {
    const params = parseCustomerParams({
      page: "2.5",
      pageSize: "25abc",
      staffId: "1 or 1=1",
      sort: "name; drop table customers",
    });

    expect(params).toEqual(defaults);
  });
});
