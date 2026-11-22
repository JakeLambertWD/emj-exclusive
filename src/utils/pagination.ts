// Shared by the server (reading the URL) and the client (the page size select)
export const PAGE_SIZES = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 25;

export type SearchParams = Record<string, string | string[] | undefined>;

export type Pagination = {
  page: number;
  pageSize: number;
};

// Reads page and pageSize from the URL. Deliberately simple for now:
// proper validation (zod, sort and filter params) replaces this in Step 9.
export function readPagination(searchParams: SearchParams): Pagination {
  const page = Math.floor(Number(searchParams.page));
  const pageSize = Number(searchParams.pageSize);

  return {
    // Anything that isn't a whole number from 1 upwards falls back to page 1
    page: Number.isFinite(page) && page >= 1 ? page : 1,
    // Only the allowed sizes, so nobody can ask for a million rows at once
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
  };
}
