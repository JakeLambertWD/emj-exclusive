import { getFilterOptions } from "@/server/customers/get-filter-options";
import { CustomerFilterSelects } from "./CustomerFilterSelects";

// Loads the staff list on the server, then hands it to the selects in the browser
export async function CustomerFilters() {
  const staff = await getFilterOptions();

  return <CustomerFilterSelects staff={staff} />;
}
