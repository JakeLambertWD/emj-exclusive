import type { ColumnType, Generated } from "kysely";

// Mirrors customer_insights_database/sql/01_schema.sql.
// node-postgres returns `numeric` as a string (to keep it exact) and
// `timestamptz` as a Date.

type CreatedAt = ColumnType<Date, Date | string | undefined, Date | string>;

export interface CustomersTable {
  id: Generated<number>;
  full_name: string;
  email: string;
  company: string | null;
  created_at: CreatedAt;
}

export interface StaffTable {
  id: Generated<number>;
  full_name: string;
  email: string;
  role: string;
  created_at: CreatedAt;
}

export type ProductCategory =
  | "Dining"
  | "Events"
  | "Experiences"
  | "Luxury Goods"
  | "Travel"
  | "Wellness";

export type DealStatus = "pending" | "completed" | "cancelled";

export interface DealsTable {
  id: Generated<number>;
  customer_id: number;
  staff_id: number | null;
  product_category: ProductCategory;
  /** GBP pounds as an exact decimal string, e.g. "1250.00" */
  deal_value: ColumnType<string, string | number, string | number>;
  status: DealStatus;
  created_at: CreatedAt;
}

export interface Database {
  customers: CustomersTable;
  staff: StaffTable;
  deals: DealsTable;
}
