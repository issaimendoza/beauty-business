import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { expenseCategories } from "../src/shared/infrastructure/database/schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
const environment = getDatabaseEnvironment();
const connection = postgres(environment.DATABASE_URL, { max: 1 });
const database = drizzle(connection);

async function main() {
  try {
    for (const categoryName of ["Insumos", "Servicios", "Renta", "Mantenimiento", "Otro"]) {
      await database.insert(expenseCategories).values({ name: categoryName, normalizedName: categoryName.toLocaleLowerCase("es-MX") }).onConflictDoNothing({ target: expenseCategories.normalizedName });
    }
    console.info("Seed de catálogos aplicado correctamente.");
  } finally { await connection.end(); }
}

main().catch((error: unknown) => { console.error("No se pudo aplicar el seed.", error); process.exitCode = 1; });
