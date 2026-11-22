import { getCustomers } from "@/server/customers/get-customers";
import { formatGbp, formatUtcDate } from "@/utils/format";
import {
  Badge,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import { EmptyValue } from "./EmptyValue";
import { StaffList } from "./StaffList";

export async function CustomerTable() {
  const customers = await getCustomers();

  return (
    <TableScrollContainer minWidth={1180}>
      <Table striped highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Customer</TableTh>
            <TableTh>Company</TableTh>
            <TableTh>Email</TableTh>
            <TableTh ta="right">Total spend</TableTh>
            <TableTh ta="right">Total deals</TableTh>
            <TableTh>Favourite category</TableTh>
            <TableTh>Associated staff</TableTh>
            <TableTh>Last deal (UTC)</TableTh>
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
              <TableTd>
                {customer.favouriteCategory ? (
                  <Badge variant="light" color="gray" radius="sm" tt="none">
                    {customer.favouriteCategory}
                  </Badge>
                ) : (
                  <EmptyValue>None yet</EmptyValue>
                )}
              </TableTd>
              <TableTd>
                <StaffList staff={customer.staff} />
              </TableTd>
              <TableTd style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {customer.lastDealAt ? (
                  formatUtcDate(customer.lastDealAt)
                ) : (
                  <EmptyValue>No completed deals</EmptyValue>
                )}
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
