import { Container, Stack, Title } from "@mantine/core";
import { CustomerFiltersContainer } from "./_components/features/CustomerFilters/CustomerFiltersContainer";
import { CustomerTableContainer } from "./_components/features/CustomerTable/CustomerTableContainer";
import { StatCardsContainer } from "./_components/features/StatCards/StatCardsContainer";

// searchParams is a Promise in Next 16. It is passed down unread, so only the parts
// that need the URL wait for it (inside their Suspense boundary)
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">
        Customers
      </Title>

      <Stack gap="xl">
        <CustomerFiltersContainer />
        <StatCardsContainer searchParams={searchParams} />
        <CustomerTableContainer searchParams={searchParams} />
      </Stack>
    </Container>
  );
}
