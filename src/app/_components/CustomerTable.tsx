import { getCustomers } from "@/server/customers/queries";
import { formatGbp } from "@/utils/format";
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
    <TableScrollContainer minWidth={820}>
      <Table striped highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Customer</TableTh>
            <TableTh>Company</TableTh>
            <TableTh>Email</TableTh>
            <TableTh ta="right">Total spend</TableTh>
            <TableTh ta="right">Total deals</TableTh>
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
              <TableTd ta="right" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatGbp(customer.totalSpend)}
              </TableTd>
              <TableTd ta="right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {customer.totalDeals}
              </TableTd>
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
