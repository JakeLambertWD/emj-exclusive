import type { ProductCategory } from "@/server/db-types";
import type { SearchParams } from "./pagination";

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

// Reads category and staffId from the URL. Anything unknown means "All".
// Proper validation with zod replaces this in Step 9.
export function readFilters(searchParams: SearchParams): Filters {
  const category = searchParams.category;
  const staffId = Number(searchParams.staffId);

  return {
    category: (PRODUCT_CATEGORIES as readonly unknown[]).includes(category) ? (category as ProductCategory) : null,
    staffId: Number.isInteger(staffId) && staffId > 0 ? staffId : null,
  };
}
