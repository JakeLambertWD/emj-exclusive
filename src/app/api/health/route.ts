import { connection } from "next/server";
import { sql } from "kysely";
import { db } from "@/server/db";

export async function GET() {
  // Always run at request time; never query the database during `next build`
  await connection();
  try {
    await sql`SELECT 1`.execute(db);
    return Response.json({ ok: true });
  } catch {
    // Don't leak connection details or stack traces to the client
    return Response.json({ ok: false }, { status: 503 });
  }
}
