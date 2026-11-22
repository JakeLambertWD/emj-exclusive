import { getCustomers } from "@/server/customers/queries";
import {
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";

export async function CustomerTable() {
  const customers = await getCustomers();

  return (
    <TableScrollContainer minWidth={640}>
      <Table striped highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Customer</TableTh>
            <TableTh>Company</TableTh>
            <TableTh>Email</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {customers.map((customer) => (
            <TableTr key={customer.id}>
              <TableTd fw={600}>{customer.fullName}</TableTd>
              <TableTd>
                {customer.company ?? (
                  <Text span c="dimmed" fs="italic" size="sm">
                    No company
                  </Text>
                )}
              </TableTd>
              <TableTd>{customer.email}</TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}

/** Shown while the table streams in. */
export function CustomerTableSkeleton() {
  return (
    <Text c="dimmed" size="sm" aria-busy="true">
      Loading customers…
    </Text>
  );
}
