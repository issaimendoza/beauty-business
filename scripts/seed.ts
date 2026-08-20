import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { applyCatalogSeed } from "./database-setup";
import { loadScriptEnvironment } from "./load-env";

loadScriptEnvironment();
const environment = getDatabaseEnvironment();
const connection = postgres(environment.DATABASE_URL, { max: 1 });
const database = drizzle(connection);

async function main() {
  try {
    await applyCatalogSeed(database);
    console.info("Seed de catálogos aplicado correctamente.");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error("No se pudo aplicar el seed.", error);
  process.exitCode = 1;
});
