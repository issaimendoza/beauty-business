import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { applyCatalogSeed, applyMigrations } from "./database-setup";
import { loadScriptEnvironment, scriptArgument } from "./load-env";
import {
  describeDatabaseTarget,
  parseBootstrapUsers,
  provisionAccount,
} from "./provision-account";

async function main() {
  if (!scriptArgument("env-file")) {
    throw new Error(
      "Indica el archivo de entorno: npm run db:bootstrap -- --env-file=.env.bootstrap",
    );
  }

  const envFile = loadScriptEnvironment();
  const users = parseBootstrapUsers(process.env);
  const { DATABASE_URL } = getDatabaseEnvironment();
  const connection = postgres(DATABASE_URL, { max: 1 });
  const database = drizzle(connection);

  try {
    console.info(`Bootstrap usando ${envFile} contra ${describeDatabaseTarget(DATABASE_URL)}.`);
    await applyMigrations(database);
    console.info("Migraciones aplicadas correctamente.");
    await applyCatalogSeed(database);
    console.info("Seed de catálogos aplicado correctamente.");

    for (const values of users) {
      await provisionAccount(database, values);
      console.info(`Cuenta aprovisionada para ${values.email}.`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "No se pudo completar el bootstrap.");
  process.exitCode = 1;
});
