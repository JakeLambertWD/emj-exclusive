import type { StaffMember } from "@/server/customers/get-customers";
import { Badge, Group, Text, VisuallyHidden } from "@mantine/core";
import { EmptyValue } from "../../common/EmptyValue";

// How many staff names to show before collapsing the rest into "+N more"
const VISIBLE_STAFF = 2;

// Shows the first few staff as badges; the full list is still read out by screen readers
export function StaffList({ staff }: { staff: StaffMember[] }) {
  if (staff.length === 0) return <EmptyValue>None</EmptyValue>;

  const visible = staff.slice(0, VISIBLE_STAFF);
  const hiddenCount = staff.length - visible.length;

  return (
    <Group
      gap={6}
      wrap="nowrap"
      title={staff.map((member) => member.name).join(", ")}
      // As wide as the badges need, so the column grows to fit instead of overlapping the next one
      style={{ width: "max-content" }}
    >
      {visible.map((member) => (
        <Badge
          key={member.id}
          variant="default"
          radius="sm"
          tt="none"
          fw={500}
          // Don't shrink to fit the column; show the whole name and let the table scroll instead
          style={{ flexShrink: 0, overflow: "visible" }}
        >
          {member.name}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <>
          <Text span size="xs" c="dimmed" aria-hidden="true" style={{ whiteSpace: "nowrap" }}>
            +{hiddenCount} more
          </Text>
          <VisuallyHidden>
            {`and ${staff
              .slice(VISIBLE_STAFF)
              .map((member) => member.name)
              .join(", ")}`}
          </VisuallyHidden>
        </>
      )}
    </Group>
  );
}
