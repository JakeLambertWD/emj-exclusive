import { Paper, Text } from "@mantine/core";

type StatCardProps = {
  label: string;
  value: string;
  /** Optional extra context under the value, e.g. "371 completed deals" */
  hint?: string;
};

// One summary figure: a small label above a large value
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="sm" c="dimmed" fw={500}>
        {label}
      </Text>
      <Text fz={26} fw={700} mt={4} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed" mt={4}>
          {hint}
        </Text>
      )}
    </Paper>
  );
}
