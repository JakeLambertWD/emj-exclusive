import type { SearchParams } from "@/utils/pagination";
import { Group, Text, Title } from "@mantine/core";
import { Suspense } from "react";
import { StatCards } from "./StatCards";
import { StatCardsSkeleton } from "./StatCardsSkeleton";

// The Summary section: its heading, scope label and the stat cards
export function StatCardsContainer({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <section aria-labelledby="summary-heading">
      <Group justify="space-between" align="baseline" mb="sm" gap="xs">
        <Title order={2} size="h4" id="summary-heading">
          Summary
        </Title>
        {/* The brief asks for the scope of these figures to be labelled clearly */}
        <Text size="sm" c="dimmed">
          All matching customers, full completed deal history
        </Text>
      </Group>

      {/*
        The stat cards wait on their own query, so they get their own skeleton.
        The heading shows immediately and the real cards replace the skeleton
        once the data arrives.
      */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
