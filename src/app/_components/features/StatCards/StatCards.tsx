import { getDashboardStats } from "@/server/customers/get-dashboard-stats";
import { parseCustomerParams } from "@/server/customers/params";
import { formatCount, formatGbp } from "@/utils/format";
import type { SearchParams } from "@/utils/pagination";
import { SimpleGrid } from "@mantine/core";
import { StatCard } from "./StatCard";

// The five summary figures. They cover every matching customer, not just the current page
export async function StatCards({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { category, staffId } = parseCustomerParams(await searchParams);
  const stats = await getDashboardStats({ category, staffId });

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 5 }} spacing="md">
      <StatCard label="Total customers" value={formatCount(stats.totalCustomers)} />
      <StatCard label="Completed deal value" value={formatGbp(stats.completedValue)} />
      <StatCard label="Completed deals" value={formatCount(stats.completedDeals)} />
      <StatCard
        label="Average customer spend"
        value={formatGbp(stats.averageSpend)}
        hint="Includes customers with no spend"
      />
      <StatCard
        label="Most popular category"
        value={stats.mostPopularCategory ?? "None yet"}
        hint={stats.mostPopularCategory ? "By number of completed deals" : "No completed deals"}
      />
    </SimpleGrid>
  );
}
