"use client";

import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { PAGE_SIZES } from "@/utils/pagination";
import { Group, Loader, NativeSelect, Pagination, Text } from "@mantine/core";

type CustomerTablePaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
};


export function CustomerTablePagination({ page, pageSize, totalCount }: CustomerTablePaginationProps) {
  // While the next page loads, the current one stays on screen and isPending is true
  const { updateSearchParams: updateUrl, isPending } = useUpdateSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstShown = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, totalCount);

  return (
    <Group justify="space-between" align="center" mt="md" gap="md">
      <Group gap="xs" align="center">
        {/* aria-live announces the new range to screen reader users after each change */}
        <Text size="sm" c="dimmed" aria-live="polite">
          Showing {firstShown}–{lastShown} of {totalCount} customers
        </Text>
        {isPending && <Loader size="xs" aria-label="Loading page" />}
      </Group>

      <Group gap="md" align="center">
        <NativeSelect
          label="Rows per page"
          size="xs"
          value={String(pageSize)}
          data={PAGE_SIZES.map(String)}
          // A new page size starts again at page 1, so the user isn't left past the end
          onChange={(event) => updateUrl({ pageSize: event.currentTarget.value, page: "1" })}
          styles={{ root: { display: "flex", alignItems: "center", gap: 8 }, label: { whiteSpace: "nowrap" } }}
        />
        <Pagination
          total={totalPages}
          value={page}
          onChange={(nextPage) => updateUrl({ page: String(nextPage) })}
          size="sm"
          withEdges
          getItemProps={(itemPage) => ({ "aria-label": `Page ${itemPage}` })}
          getControlProps={(control) => ({
            "aria-label": {
              first: "First page",
              previous: "Previous page",
              next: "Next page",
              last: "Last page",
            }[control],
          })}
        />
      </Group>
    </Group>
  );
}
