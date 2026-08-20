import { config } from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
const environment = getDatabaseEnvironment();
const connection = postgres(environment.DATABASE_URL, { max: 1 });
const database = drizzle(connection);

async function main() {
  try {
    await migrate(database, { migrationsFolder: "drizzle" });
    console.info("Migraciones aplicadas correctamente.");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error("No se pudieron aplicar las migraciones.", error);
  process.exitCode = 1;
});
