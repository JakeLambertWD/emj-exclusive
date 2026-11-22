"use client";

import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { FIRST_CLICK_DIRECTION, type Sort, type SortField } from "@/utils/sorting";
import { Loader, TableTh, UnstyledButton } from "@mantine/core";
import { SortIcon } from "./SortIcon";

type SortableThProps = {
  /** The column this header sorts by */
  field: SortField;
  /** The table's current sort, read from the URL on the server */
  current: Sort;
  label: string;
  align?: "left" | "right";
};

// A column header that sorts the table when clicked.
// It's a real <button>, so it works with the keyboard (Tab, then Enter or Space),
// and the header cell carries aria-sort so screen readers announce the sort order.
export function SortableTh({ field, current, label, align = "left" }: SortableThProps) {
  const { updateSearchParams, isPending } = useUpdateSearchParams();

  const isSorted = current.sort === field;
  const direction = isSorted ? current.dir : null;

  function handleClick() {
    // Clicking the sorted column flips it; clicking another column starts with its natural order
    const nextDir = isSorted ? (current.dir === "asc" ? "desc" : "asc") : FIRST_CLICK_DIRECTION[field];
    // A new order starts again at page 1
    updateSearchParams({ sort: field, dir: nextDir, page: "1" });
  }

  return (
    <TableTh
      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
      style={{ padding: 0 }}
    >
      <UnstyledButton
        onClick={handleClick}
        w="100%"
        px="sm"
        py="xs"
        fz="sm"
        fw={isSorted ? 700 : 600}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {isPending ? <Loader size={12} aria-label="Sorting" /> : <SortIcon direction={direction} />}
      </UnstyledButton>
    </TableTh>
  );
}
