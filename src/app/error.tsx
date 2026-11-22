"use client";

import { Button, Container, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect } from "react";

// Shown when anything on the page fails, e.g. the database is down.
// The real error, with its stack trace, is logged on the server by Next.
// In production the browser only receives a generic message and a digest: a short id that
// matches the server log entry, so the user never sees connection details or stack traces.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = (error as { digest?: string } | null)?.digest;

  useEffect(() => {
    // Also log in the browser console, for whoever is debugging locally
    console.error(error);
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Paper withBorder radius="md" p="xl">
        <Stack align="center" gap="sm" ta="center" role="alert">
          <ThemeIcon variant="light" color="red" size={48} radius="xl">
            <IconAlertTriangle size={24} aria-hidden />
          </ThemeIcon>
          <Title order={2} size="h4">
            We couldn&apos;t load customers
          </Title>
          <Text size="sm" c="dimmed" maw={420}>
            Something went wrong while fetching the data. Please try again in a moment.
          </Text>
          {/* Re-runs the page's queries; if they succeed this message is replaced by the dashboard */}
          <Button onClick={() => retry()}>Try again</Button>
          {digest && (
            <Text size="xs" c="dimmed">
              Reference: {digest}
            </Text>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
