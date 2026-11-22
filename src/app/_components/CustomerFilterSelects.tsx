"use client";

import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import type { StaffOption } from "@/server/customers/get-filter-options";
import { PRODUCT_CATEGORIES } from "@/utils/filters";
import { Group, Loader, NativeSelect } from "@mantine/core";
import { useSearchParams } from "next/navigation";

// The category and staff selects. Each writes to the URL; the server reads the URL and
// narrows both the table and the stats to the matching customers.
// "All" is an empty value, which removes the param from the URL.
export function CustomerFilterSelects({ staff }: { staff: StaffOption[] }) {
  const searchParams = useSearchParams();
  const { updateSearchParams, isPending } = useUpdateSearchParams();

  // A new filter starts again at page 1, so nobody is left on a page that no longer exists
  function handleChange(key: "category" | "staffId", value: string) {
    updateSearchParams({ [key]: value, page: "1" });
  }

  return (
    <Group align="flex-end" gap="md">
      <NativeSelect
        label="Product category"
        // Read straight from the URL, so Back and Forward keep the select in step
        value={searchParams.get("category") ?? ""}
        data={[{ value: "", label: "All categories" }, ...PRODUCT_CATEGORIES]}
        onChange={(event) => handleChange("category", event.currentTarget.value)}
        w={220}
      />
      <NativeSelect
        label="Staff member"
        value={searchParams.get("staffId") ?? ""}
        data={[
          { value: "", label: "All staff" },
          ...staff.map((member) => ({ value: String(member.id), label: member.name })),
        ]}
        onChange={(event) => handleChange("staffId", event.currentTarget.value)}
        w={220}
      />
      {isPending && <Loader size="sm" mb={8} aria-label="Applying filters" />}
    </Group>
  );
}
