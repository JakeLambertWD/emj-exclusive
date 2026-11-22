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
