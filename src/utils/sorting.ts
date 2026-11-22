import type { SearchParams } from "./pagination";

// The columns the table can be sorted by
export const SORT_FIELDS = ["name", "spend", "deals", "lastDeal"] as const;

// "name" | "spend" | "deals" | "lastDeal", built from the list above so the two never drift apart
export type SortField = (typeof SORT_FIELDS)[number];

export type SortDirection = "asc" | "desc";

// What the table is sorted by, e.g. { sort: "spend", dir: "desc" }
export type Sort = {
  sort: SortField;
  dir: SortDirection;
};

// Used when the URL has no sort, or one we don't recognise: name, A to Z
export const DEFAULT_SORT: Sort = { sort: "name", dir: "asc" };

// The direction a column sorts in the first time it's clicked.
// Names go A to Z; numbers and dates go biggest or newest first.
export const FIRST_CLICK_DIRECTION: Record<SortField, SortDirection> = {
  name: "asc",
  spend: "desc",
  deals: "desc",
  lastDeal: "desc",
};

// Is this URL value one of the sortable columns?
function isSortField(value: unknown): value is SortField {
  return SORT_FIELDS.some((field) => field === value);
}

// Is this URL value "asc" or "desc"?
function isSortDirection(value: unknown): value is SortDirection {
  return value === "asc" || value === "desc";
}

// Reads sort and dir from the URL, e.g. ?sort=spend&dir=desc.
// Anything missing or unknown falls back to the default.
// Proper validation with zod replaces this in Step 9.
export function readSort(searchParams: SearchParams): Sort {
  const { sort, dir } = searchParams;

  return {
    sort: isSortField(sort) ? sort : DEFAULT_SORT.sort,
    dir: isSortDirection(dir) ? dir : DEFAULT_SORT.dir,
  };
}
