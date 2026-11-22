import { Text } from "@mantine/core";

/** Shown while the table streams in. */
export function CustomerTableSkeleton() {
  return (
    <Text c="dimmed" size="sm" aria-busy="true">
      Loading customers…
    </Text>
  );
}
