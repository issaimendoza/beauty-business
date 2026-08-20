import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { hash } from "@node-rs/argon2";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { account, user } from "../src/shared/infrastructure/database/schema";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

function argument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function hiddenQuestion(prompt: string): Promise<string> {
  if (!stdin.isTTY || !stdin.setRawMode) throw new Error("Este comando requiere una terminal interactiva para ocultar la contraseña.");
  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(prompt);
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
    const finish = () => { stdin.removeListener("data", onData); stdin.setRawMode(false); stdin.pause(); stdout.write("\n"); };
    const onData = (character: string) => {
      if (character === "\u0003") { finish(); reject(new Error("Aprovisionamiento cancelado.")); return; }
      if (character === "\r" || character === "\n") { finish(); resolve(value); return; }
      if (character === "\u007f" || character === "\b") { if (value) { value = value.slice(0, -1); stdout.write("\b \b"); } return; }
      if (character >= " ") { value += character; stdout.write("•"); }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  const emailValue = argument("email") ?? await prompt.question("Correo: ");
  const nameValue = argument("name") ?? await prompt.question("Nombre visible: ");
  prompt.close();
  const password = await hiddenQuestion("Contraseña: ");
  const confirmation = await hiddenQuestion("Confirma la contraseña: ");
  if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
  const values = z.object({ email: z.email(), name: z.string().trim().min(2).max(120), password: z.string().min(12).max(128) }).parse({ email: emailValue.trim().toLowerCase(), name: nameValue, password });
  const { DATABASE_URL } = getDatabaseEnvironment();
  const connection = postgres(DATABASE_URL, { max: 1 });
  const database = drizzle(connection);
  try {
    const existing = await database.select({ id: user.id }).from(user).where(eq(user.email, values.email)).limit(1);
    const userId = existing[0]?.id ?? randomUUID();
    if (existing[0]) await database.update(user).set({ name: values.name }).where(eq(user.id, userId));
    else await database.insert(user).values({ id: userId, email: values.email, name: values.name, emailVerified: true });
    const passwordHash = await hash(values.password, { algorithm: 2, memoryCost: 65_536, timeCost: 3, parallelism: 1, outputLen: 32 });
    await database.insert(account).values({ id: randomUUID(), issuer: "local:credential", accountId: userId, providerId: "credential", userId, password: passwordHash }).onConflictDoUpdate({ target: [account.issuer, account.accountId], set: { password: passwordHash, updatedAt: new Date() } });
    console.info(`Cuenta aprovisionada para ${values.email}.`);
  } finally { await connection.end(); }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "No se pudo aprovisionar la cuenta."); process.exitCode = 1; });
