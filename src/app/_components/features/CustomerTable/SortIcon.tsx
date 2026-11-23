import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";

type SortIconProps = {
  /** Which way the column is sorted, or null when it isn't the sorted column */
  direction: "asc" | "desc" | null;
};

// Icon next to a sortable header: up for ascending, down for descending,
// and a faint up-and-down selector for a column you could sort by.
// Decorative only: the header's aria-sort tells screen readers the sort order
export function SortIcon({ direction }: SortIconProps) {
  const iconProps = { size: 14, stroke: 2, "aria-hidden": true, style: { flexShrink: 0 } } as const;

  if (direction === "asc") return <IconChevronUp {...iconProps} />;
  if (direction === "desc") return <IconChevronDown {...iconProps} />;
  return <IconSelector {...iconProps} style={{ flexShrink: 0, opacity: 0.45 }} />;
}
