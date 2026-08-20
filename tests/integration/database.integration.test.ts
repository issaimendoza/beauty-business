import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { expenseCategories } from "@/shared/infrastructure/database/schema";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
let connection: ReturnType<typeof postgres> | undefined;

suite("migrations and seed", () => {
  beforeAll(() => { connection = postgres(databaseUrl!, { max: 1 }); });
  afterAll(async () => { await connection?.end(); });

  it("expone las quince tablas de la versión inicial", async () => {
    const rows = await connection!<{ count: string }[]>`
      select count(*)::text count
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('auth_user','auth_session','auth_account','auth_verification','staff','staff_agreement','service','product','vendor','expense_category','visit','visit_service','expense','lost_opportunity','daily_closure')
    `;
    expect(Number(rows[0].count)).toBe(15);
  });

  it("el seed idempotente conserva categorías únicas", async () => {
    const database = drizzle(connection!);
    const rows = await database.select().from(expenseCategories);
    const names = new Set(rows.map((item) => item.normalizedName));
    expect(names.size).toBe(rows.length);
    expect([...names]).toEqual(expect.arrayContaining(["insumos", "servicios", "renta", "mantenimiento", "otro"]));
  });
});
