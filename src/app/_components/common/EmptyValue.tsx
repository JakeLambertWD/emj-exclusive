import { Text } from "@mantine/core";

// Clear, consistent placeholder for values a customer doesn't have yet
export function EmptyValue({ children }: { children: string }) {
  return (
    <Text span size="sm" c="dimmed">
      {children}
    </Text>
  );
}
