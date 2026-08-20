import { existsSync } from "node:fs";

import { config } from "dotenv";

export function scriptArgument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

export function loadScriptEnvironment() {
  const envFile = scriptArgument("env-file");
  if (envFile) {
    if (!existsSync(envFile)) {
      throw new Error(`No existe el archivo de entorno ${envFile}.`);
    }

    const result = config({ path: envFile });
    if (result.error) {
      throw result.error;
    }

    return envFile;
  }

  config({ path: ".env.local", quiet: true });
  config({ quiet: true });
  return undefined;
}
