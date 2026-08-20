import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BUSINESS_TIME_ZONE: z.string().min(1).default("America/Mexico_City"),
});

export type Environment = z.infer<typeof environmentSchema>;

const databaseEnvironmentSchema = z.object({ DATABASE_URL: z.url() });

let cachedEnvironment: Environment | undefined;

export function getEnvironment(): Environment {
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const parsed = environmentSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuración de ambiente inválida: ${issues}`);
  }

  cachedEnvironment = parsed.data;
  return cachedEnvironment;
}

export function getDatabaseEnvironment() {
  return databaseEnvironmentSchema.parse(process.env);
}
