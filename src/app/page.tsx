import { Container, Stack, Title } from "@mantine/core";
import { CustomerTableContainer } from "./_components/CustomerTableContainer";
import { StatCardsContainer } from "./_components/StatCardsContainer";

// searchParams is a Promise in Next 16. It is passed down unread, so only the parts
// that need the URL wait for it (inside their Suspense boundary)
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">
        Customers
      </Title>

      <Stack gap="xl">
        <StatCardsContainer />
        <CustomerTableContainer searchParams={searchParams} />
      </Stack>
    </Container>
  );
}
