import { db } from "@/server/db";
import "server-only";

export type CustomerRow = {
  id: number;
  fullName: string;
  email: string;
  company: string | null;
};

export async function getCustomers(): Promise<CustomerRow[]> {
  return db
    .selectFrom("customers as c")
    .select(["c.id", "c.full_name as fullName", "c.email", "c.company"])
    .orderBy("c.full_name")
    .orderBy("c.id")
    .limit(25)
    .execute();
}
