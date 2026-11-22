"use client";

import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Button } from "@mantine/core";

// Removes the search and filters but keeps the sort and page size, and goes back to page 1
export function ClearFiltersButton() {
  const { updateSearchParams, isPending } = useUpdateSearchParams();

  return (
    <Button
      variant="default"
      loading={isPending}
      onClick={() => updateSearchParams({ q: "", category: "", staffId: "", page: "1" })}
    >
      Clear search and filters
    </Button>
  );
}
