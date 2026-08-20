import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { applyMigrations } from "./database-setup";
import { loadScriptEnvironment } from "./load-env";

loadScriptEnvironment();
const environment = getDatabaseEnvironment();
const connection = postgres(environment.DATABASE_URL, { max: 1 });
const database = drizzle(connection);

async function main() {
  try {
    await applyMigrations(database);
    console.info("Migraciones aplicadas correctamente.");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error("No se pudieron aplicar las migraciones.", error);
  process.exitCode = 1;
});
