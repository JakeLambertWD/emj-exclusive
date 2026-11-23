import { Group, Skeleton, Stack, Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";

// How many placeholder rows to show while the table loads
const SKELETON_ROWS = 8;

// The table's eight columns, so the placeholder has the same shape as the real table
const COLUMN_COUNT = 8;

/** Shown while the table streams in. Same layout as CustomerTable, so nothing jumps when it arrives. */
export function CustomerTableSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading customers">
      <TableScrollContainer minWidth={1180}>
        <Table>
          <TableThead>
            <TableTr>
              {Array.from({ length: COLUMN_COUNT }, (_, index) => (
                <TableTh key={index}>
                  <Skeleton height={12} width="70%" />
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {Array.from({ length: SKELETON_ROWS }, (_, row) => (
              <TableTr key={row}>
                {Array.from({ length: COLUMN_COUNT }, (_, column) => (
                  <TableTd key={column}>
                    <Skeleton height={12} width={column === 0 ? "80%" : "60%"} />
                  </TableTd>
                ))}
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
      <Group justify="space-between">
        <Skeleton height={12} width={200} />
        <Skeleton height={28} width={260} />
      </Group>
    </Stack>
  );
}
