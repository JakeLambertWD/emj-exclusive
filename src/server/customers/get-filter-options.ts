import { db } from "@/server/db";
import "server-only";

export type StaffOption = {
  id: number;
  name: string;
};

// Every staff member for the staff filter, A to Z; id keeps people with the same name in a fixed order
export async function getFilterOptions(): Promise<StaffOption[]> {
  return db.selectFrom("staff").select(["id", "full_name as name"]).orderBy("full_name").orderBy("id").execute();
}
