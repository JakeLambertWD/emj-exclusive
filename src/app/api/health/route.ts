import { connection } from "next/server";
import { pool } from "@/server/db";

export async function GET() {
  // Always run at request time; never query the database during `next build`
  await connection();
  try {
    await pool.query("SELECT 1");
    return Response.json({ ok: true });
  } catch {
    // Don't leak connection details or stack traces to the client
    return Response.json({ ok: false }, { status: 503 });
  }
}
