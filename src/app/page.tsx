import { Container, Stack, Title } from "@mantine/core";
import { CustomerTableContainer } from "./_components/CustomerTableContainer";
import { StatCardsContainer } from "./_components/StatCardsContainer";

export default function Home() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">
        Customers
      </Title>

      <Stack gap="xl">
        <StatCardsContainer />
        <CustomerTableContainer />
      </Stack>
    </Container>
  );
}
