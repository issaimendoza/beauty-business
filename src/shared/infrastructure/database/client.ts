import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnvironment } from "@/shared/infrastructure/config/env";
import * as schema from "@/shared/infrastructure/database/schema";

const globalDatabase = globalThis as typeof globalThis & {
  beautySql?: ReturnType<typeof postgres>;
};

const sql =
  globalDatabase.beautySql ??
  postgres(getEnvironment().DATABASE_URL, {
    max: getEnvironment().NODE_ENV === "production" ? 10 : 4,
    idle_timeout: 20,
    prepare: false,
  });

if (getEnvironment().NODE_ENV !== "production") {
  globalDatabase.beautySql = sql;
}

export const database = drizzle(sql, { schema });
export type Database = typeof database;
