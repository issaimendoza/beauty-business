import { describe, expect, it } from "vitest";

import { parseBootstrapUsers } from "../../scripts/provision-account";

const validPassword = "contrasena-valida-12";

describe("parseBootstrapUsers", () => {
  it("requires the first complete user when no bootstrap accounts are defined", () => {
    expect(() => parseBootstrapUsers({})).toThrow(/BOOTSTRAP_USER_1_EMAIL/);
  });

  it("accepts a single complete account and normalizes the email", () => {
    const users = parseBootstrapUsers({
      BOOTSTRAP_USER_1_EMAIL: "  Andrea@Ejemplo.com ",
      BOOTSTRAP_USER_1_NAME: "Andrea",
      BOOTSTRAP_USER_1_PASSWORD: validPassword,
    });

    expect(users).toEqual([
      { email: "andrea@ejemplo.com", name: "Andrea", password: validPassword },
    ]);
  });

  it("accepts both V1 accounts", () => {
    const users = parseBootstrapUsers({
      BOOTSTRAP_USER_1_EMAIL: "andrea@ejemplo.com",
      BOOTSTRAP_USER_1_NAME: "Andrea",
      BOOTSTRAP_USER_1_PASSWORD: validPassword,
      BOOTSTRAP_USER_2_EMAIL: "operadora@ejemplo.com",
      BOOTSTRAP_USER_2_NAME: "Operadora",
      BOOTSTRAP_USER_2_PASSWORD: "otra-contrasena-12",
    });

    expect(users).toHaveLength(2);
    expect(users[1]?.email).toBe("operadora@ejemplo.com");
  });

  it("rejects a partial account slot", () => {
    expect(() =>
      parseBootstrapUsers({
        BOOTSTRAP_USER_1_EMAIL: "andrea@ejemplo.com",
        BOOTSTRAP_USER_1_NAME: "Andrea",
      }),
    ).toThrow(/deben definirse juntas/);
  });

  it("rejects an invalid email without exposing the password", () => {
    expect(() =>
      parseBootstrapUsers({
        BOOTSTRAP_USER_1_EMAIL: "no-es-un-correo",
        BOOTSTRAP_USER_1_NAME: "Andrea",
        BOOTSTRAP_USER_1_PASSWORD: validPassword,
      }),
    ).toThrow(/no son válidos/);
  });
});
