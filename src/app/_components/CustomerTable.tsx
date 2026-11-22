import { getCustomers } from "@/server/customers/get-customers";
import { formatGbp, formatUtcDate } from "@/utils/format";
import { readPagination, type SearchParams } from "@/utils/pagination";
import { readSort } from "@/utils/sorting";
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
import { CustomerTablePagination } from "./CustomerTablePagination";
import { EmptyValue } from "./EmptyValue";
import { SortableTh } from "./SortableTh";
import { StaffList } from "./StaffList";

export async function CustomerTable({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Converts searchParams to 2 numbers 
  const params = await searchParams;
  const { page: requestedPage, pageSize } = readPagination(params);
  const sort = readSort(params);
  const { customers, totalCount, page } = await getCustomers({ page: requestedPage, pageSize, ...sort });

  return (
    <>
      <TableScrollContainer minWidth={1180}>
        <Table striped highlightOnHover>
          <TableThead>
            <TableTr>
              <SortableTh field="name" current={sort} label="Customer" />
              <TableTh>Company</TableTh>
              <TableTh>Email</TableTh>
              <SortableTh field="spend" current={sort} label="Total spend" align="right" />
              <SortableTh field="deals" current={sort} label="Total deals" align="right" />
              <TableTh>Favourite category</TableTh>
              <TableTh>Associated staff</TableTh>
              <SortableTh field="lastDeal" current={sort} label="Last deal (UTC)" />
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
      <CustomerTablePagination page={page} pageSize={pageSize} totalCount={totalCount} />
    </>
  );
}
