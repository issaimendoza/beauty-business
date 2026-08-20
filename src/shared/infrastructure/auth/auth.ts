import "server-only";

import { hash, verify } from "@node-rs/argon2";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { getEnvironment } from "@/shared/infrastructure/config/env";
import { database } from "@/shared/infrastructure/database/client";
import { schema } from "@/shared/infrastructure/database/schema";

const environment = getEnvironment();

export const auth = betterAuth({
  appName: "Beauty Business",
  baseURL: environment.BETTER_AUTH_URL,
  secret: environment.BETTER_AUTH_SECRET,
  database: drizzleAdapter(database, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    password: {
      hash: (password) =>
        hash(password, {
          algorithm: 2,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 1,
          outputLen: 32,
        }),
      verify: ({ hash: passwordHash, password }) => verify(passwordHash, password),
    },
  },
  session: {
    expiresIn: 60 * 60 * 12,
    disableSessionRefresh: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (createdSession) => { console.info("Evento de autenticación", { event: "session_created", userId: createdSession.userId }); },
      },
      delete: {
        after: async (deletedSession) => { console.info("Evento de autenticación", { event: "session_revoked", userId: deletedSession.userId }); },
      },
    },
  },
  advanced: {
    cookiePrefix: "beauty_business",
    useSecureCookies: environment.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: environment.NODE_ENV === "production",
      path: "/",
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
