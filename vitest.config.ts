import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

// The data-access tests talk to the Docker Postgres, using DATABASE_URL from .env
// (localhost:55432). A value already set in the environment, e.g. in CI, is kept
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" throws outside Next's bundler; tests import server code directly
      "server-only": path.resolve(__dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    // Test files share one database, so run them one at a time rather than in parallel
    fileParallelism: false,
  },
});
