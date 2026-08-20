import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { expenseCategories } from "../src/shared/infrastructure/database/schema";

const catalogSeedCategoryNames = ["Insumos", "Servicios", "Renta", "Mantenimiento", "Otro"] as const;

export async function applyMigrations(database: PostgresJsDatabase) {
  await migrate(database, { migrationsFolder: "drizzle" });
}

export async function applyCatalogSeed(database: PostgresJsDatabase) {
  for (const categoryName of catalogSeedCategoryNames) {
    await database.insert(expenseCategories).values({
      name: categoryName,
      normalizedName: categoryName.toLocaleLowerCase("es-MX"),
    }).onConflictDoNothing({ target: expenseCategories.normalizedName });
  }
}
