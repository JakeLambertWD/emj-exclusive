// Shared by the server (validating the URL) and the client (the page size select)
export const PAGE_SIZES = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 25;

export type SearchParams = Record<string, string | string[] | undefined>;

export type Pagination = {
  page: number;
  pageSize: number;
};
