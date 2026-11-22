import type { ProductCategory } from "@/server/db-types";

// The six categories from the data dictionary, in the order the select shows them
export const PRODUCT_CATEGORIES = [
  "Dining",
  "Events",
  "Experiences",
  "Luxury Goods",
  "Travel",
  "Wellness",
] as const satisfies readonly ProductCategory[];

// null means "All": no filter on that field
export type Filters = {
  category: ProductCategory | null;
  staffId: number | null;
};
