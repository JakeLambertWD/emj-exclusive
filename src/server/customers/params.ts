import { PRODUCT_CATEGORIES, type Filters } from "@/utils/filters";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES, type Pagination, type SearchParams } from "@/utils/pagination";
import { DEFAULT_SORT, SORT_FIELDS, type Sort } from "@/utils/sorting";
import "server-only";
import { z } from "zod";

// Longest search term accepted; anything longer is cut, so a huge URL can't become a huge query
const MAX_SEARCH_LENGTH = 100;

// ?category=Travel&category=Dining arrives as an array. Use the first value, as the brief's
// single select filters only ever send one
function firstValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

// Every URL param the dashboard reads, with its rules.
// Each field has .catch(), so a missing or invalid value falls back to its default instead
// of throwing: a tampered URL shows the normal dashboard rather than an error page.
const customerParamsSchema = z.object({
  // Search term: trimmed, capped, "" when absent (used once search is added)
  q: z.preprocess(
    firstValue,
    z
      .string()
      .trim()
      .transform((value) => value.slice(0, MAX_SEARCH_LENGTH))
      .catch(""),
  ),
  // One of the six categories exactly (case sensitive); anything else means "All" (null)
  category: z.preprocess(firstValue, z.enum(PRODUCT_CATEGORIES).nullable().catch(null)),
  // A whole number from 1 upwards; anything else means "All" (null)
  staffId: z.preprocess(firstValue, z.coerce.number().int().positive().nullable().catch(null)),
  // Allowlisted sort columns and directions; the server maps these to fixed SQL
  sort: z.preprocess(firstValue, z.enum(SORT_FIELDS).catch(DEFAULT_SORT.sort)),
  dir: z.preprocess(firstValue, z.enum(["asc", "desc"]).catch(DEFAULT_SORT.dir)),
  // A whole number from 1 upwards; pages past the end are moved back to the last page later
  page: z.preprocess(firstValue, z.coerce.number().int().min(1).catch(1)),
  // Only the allowed sizes, so nobody can ask for a million rows at once
  pageSize: z.preprocess(
    firstValue,
    z.coerce
      .number()
      .refine((size) => (PAGE_SIZES as readonly number[]).includes(size))
      .catch(DEFAULT_PAGE_SIZE),
  ),
});

export type CustomerParams = Pagination & Sort & Filters & { q: string };

// Turns the raw URL params into safe, typed values. Never throws
export function parseCustomerParams(searchParams: SearchParams): CustomerParams {
  return customerParamsSchema.parse(searchParams);
}
