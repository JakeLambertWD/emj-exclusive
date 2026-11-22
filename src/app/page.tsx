import { Container, Title } from "@mantine/core";
import { Suspense } from "react";
import { CustomerTable, CustomerTableSkeleton } from "./_components/CustomerTable";

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">
        Customers
      </Title>

      {/*
        CustomerTable waits on the database, so show a skeleton in its place.
        The rest of the page loads immediately and the real table replaces
        the skeleton once the data arrives.
      */}
      <Suspense fallback={<CustomerTableSkeleton />}>
        <CustomerTable />
      </Suspense>
    </Container>
  );
}
