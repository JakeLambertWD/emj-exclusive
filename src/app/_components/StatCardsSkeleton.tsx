import { Paper, SimpleGrid, Skeleton } from "@mantine/core";

/** Shown while the summary figures stream in. Same grid as StatCards so nothing jumps. */
export function StatCardsSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 5 }} spacing="md" aria-busy="true" aria-label="Loading summary">
      {Array.from({ length: 5 }, (_, index) => (
        <Paper key={index} withBorder radius="md" p="md">
          <Skeleton height={12} width="60%" />
          <Skeleton height={26} width="80%" mt={10} />
        </Paper>
      ))}
    </SimpleGrid>
  );
}
