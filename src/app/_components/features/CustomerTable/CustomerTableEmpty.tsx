import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconDatabaseOff, IconFilterOff } from "@tabler/icons-react";
import { ClearFiltersButton } from "./ClearFiltersButton";

type CustomerTableEmptyProps = {
  /** true when a search or filter is narrowing the results */
  hasFilters: boolean;
};

// Shown in place of the table when no customers come back. Two different situations:
// - filters are on and nothing matches: offer a way to clear them
// - no filters and still nothing: the database has no customers (e.g. the seed didn't load)
export function CustomerTableEmpty({ hasFilters }: CustomerTableEmptyProps) {
  return (
    <Paper withBorder radius="md" p="xl">
      {/* role="status" announces the message to screen reader users when it appears */}
      <Stack align="center" gap="sm" ta="center" role="status">
        <ThemeIcon variant="light" color="gray" size={48} radius="xl">
          {hasFilters ? <IconFilterOff size={24} aria-hidden /> : <IconDatabaseOff size={24} aria-hidden />}
        </ThemeIcon>
        <Title order={3} size="h5">
          {hasFilters ? "No customers match these filters" : "No customers yet"}
        </Title>
        <Text size="sm" c="dimmed" maw={420}>
          {hasFilters
            ? "No customer has a completed deal that matches everything selected. Try a different category or staff member, or clear them to see everyone."
            : "There are no customer records in the database. Check that the assessment data has loaded."}
        </Text>
        {hasFilters && <ClearFiltersButton />}
      </Stack>
    </Paper>
  );
}
