import { randomUUID } from "node:crypto";

import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { z } from "zod";

import { account, user } from "../src/shared/infrastructure/database/schema";

const passwordMinLength = 12;
const passwordMaxLength = 128;
const visibleNameMinLength = 2;
const visibleNameMaxLength = 120;
const bootstrapUserSlots = [1, 2] as const;

const provisionedUserSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(visibleNameMinLength).max(visibleNameMaxLength),
  password: z.string().min(passwordMinLength).max(passwordMaxLength),
});

export type ProvisionedUser = z.infer<typeof provisionedUserSchema>;

export function parseProvisionedUser(input: {
  email: string;
  name: string;
  password: string;
}): ProvisionedUser {
  try {
    return provisionedUserSchema.parse({
      email: input.email.trim().toLowerCase(),
      name: input.name,
      password: input.password,
    });
  } catch {
    throw new Error(
      `El correo, el nombre (${visibleNameMinLength}-${visibleNameMaxLength} caracteres) o la contraseña (${passwordMinLength}-${passwordMaxLength} caracteres) no son válidos.`,
    );
  }
}

function readBootstrapSlot(
  env: Record<string, string | undefined>,
  slot: (typeof bootstrapUserSlots)[number],
) {
  const email = env[`BOOTSTRAP_USER_${slot}_EMAIL`];
  const name = env[`BOOTSTRAP_USER_${slot}_NAME`];
  const password = env[`BOOTSTRAP_USER_${slot}_PASSWORD`];
  const definedCount = [email, name, password].filter((value) => value && value.length > 0).length;

  if (definedCount === 0) {
    return undefined;
  }

  if (definedCount !== 3) {
    throw new Error(
      `BOOTSTRAP_USER_${slot}_EMAIL, BOOTSTRAP_USER_${slot}_NAME y BOOTSTRAP_USER_${slot}_PASSWORD deben definirse juntas.`,
    );
  }

  return parseProvisionedUser({ email, name, password });
}

export function parseBootstrapUsers(env: Record<string, string | undefined>): ProvisionedUser[] {
  const users = bootstrapUserSlots
    .map((slot) => readBootstrapSlot(env, slot))
    .filter((value): value is ProvisionedUser => value !== undefined);

  if (users.length === 0) {
    throw new Error(
      "Define al menos BOOTSTRAP_USER_1_EMAIL, BOOTSTRAP_USER_1_NAME y BOOTSTRAP_USER_1_PASSWORD en el archivo de entorno.",
    );
  }

  return users;
}

export async function provisionAccount(
  database: PostgresJsDatabase,
  values: ProvisionedUser,
) {
  const existing = await database
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, values.email))
    .limit(1);
  const userId = existing[0]?.id ?? randomUUID();

  if (existing[0]) {
    await database.update(user).set({ name: values.name }).where(eq(user.id, userId));
  } else {
    await database.insert(user).values({
      id: userId,
      email: values.email,
      name: values.name,
      emailVerified: true,
    });
  }

  const passwordHash = await hash(values.password, {
    algorithm: 2,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  await database.insert(account).values({
    id: randomUUID(),
    issuer: "local:credential",
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
  }).onConflictDoUpdate({
    target: [account.issuer, account.accountId],
    set: { password: passwordHash, updatedAt: new Date() },
  });
}

export function describeDatabaseTarget(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    const port = parsed.port || "5432";
    return `${parsed.hostname}:${port}${parsed.pathname}`;
  } catch {
    return "(url inválida)";
  }
}
