import type { SearchParams } from "@/utils/pagination";
import { Title } from "@mantine/core";
import { Suspense } from "react";
import { CustomerTable } from "./CustomerTable";
import { CustomerTableSkeleton } from "./CustomerTableSkeleton";

// The Customer table section: its heading and the table
export function CustomerTableContainer({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <section aria-labelledby="table-heading">
      <Title order={2} size="h4" id="table-heading" mb="sm">
        Customer table
      </Title>

      {/*
        The table waits on its own query, so it gets its own skeleton.
        The heading shows immediately and the real table replaces the
        skeleton once the data arrives.
      */}
      <Suspense fallback={<CustomerTableSkeleton />}>
        <CustomerTable searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
