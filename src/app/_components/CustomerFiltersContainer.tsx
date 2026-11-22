import { Group, NativeSelect, Paper } from "@mantine/core";
import { Suspense } from "react";
import { CustomerFilters } from "./CustomerFilters";

// The filter bar above the summary and the table
export function CustomerFiltersContainer() {
  return (
    <Paper withBorder radius="md" p="md" component="section" aria-label="Filters">
      {/*
        The staff list comes from the database, so the selects get their own fallback.
        Disabled selects of the same size show until it arrives, so nothing jumps.
      */}
      <Suspense
        fallback={
          <Group align="flex-end" gap="md">
            <NativeSelect label="Product category" data={["All categories"]} w={220} disabled />
            <NativeSelect label="Staff member" data={["All staff"]} w={220} disabled />
          </Group>
        }
      >
        <CustomerFilters />
      </Suspense>
    </Paper>
  );
}
