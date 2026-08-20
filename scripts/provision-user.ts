import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseEnvironment } from "../src/shared/infrastructure/config/env";
import { loadScriptEnvironment, scriptArgument } from "./load-env";
import { parseProvisionedUser, provisionAccount } from "./provision-account";

loadScriptEnvironment();

function hiddenQuestion(prompt: string): Promise<string> {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error("Este comando requiere una terminal interactiva para ocultar la contraseña.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const finish = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    const onData = (character: string) => {
      if (character === "\u0003") {
        finish();
        reject(new Error("Aprovisionamiento cancelado."));
        return;
      }
      if (character === "\r" || character === "\n") {
        finish();
        resolve(value);
        return;
      }
      if (character === "\u007f" || character === "\b") {
        if (value) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
        return;
      }
      if (character >= " ") {
        value += character;
        stdout.write("•");
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  const emailValue = scriptArgument("email") ?? await prompt.question("Correo: ");
  const nameValue = scriptArgument("name") ?? await prompt.question("Nombre visible: ");
  prompt.close();
  const password = await hiddenQuestion("Contraseña: ");
  const confirmation = await hiddenQuestion("Confirma la contraseña: ");
  if (password !== confirmation) {
    throw new Error("Las contraseñas no coinciden.");
  }

  const values = parseProvisionedUser({ email: emailValue, name: nameValue, password });
  const { DATABASE_URL } = getDatabaseEnvironment();
  const connection = postgres(DATABASE_URL, { max: 1 });
  const database = drizzle(connection);

  try {
    await provisionAccount(database, values);
    console.info(`Cuenta aprovisionada para ${values.email}.`);
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "No se pudo aprovisionar la cuenta.");
  process.exitCode = 1;
});
