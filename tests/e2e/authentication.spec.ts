import { expect, test } from "@playwright/test";

test("rechaza credenciales desconocidas sin enumerar la cuenta", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(`desconocida-${Date.now()}@beauty.local`);
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill("UnaClaveInvalida!2026");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("No pudimos iniciar sesión.")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("la API de negocio y el registro público permanecen cerrados", async ({ request }) => {
  const insights = await request.get("/api/insights");
  expect(insights.status()).toBe(401);
  const signUp = await request.post("/api/auth/sign-up/email", { data: { name: "No autorizada", email: `alta-${Date.now()}@beauty.local`, password: "UnaClaveNueva!2026" } });
  expect(signUp.ok()).toBeFalsy();
});

test("redirige el contenido privado al acceso", async ({ page }) => {
  await page.goto("/insights");
  await expect(page).toHaveURL(/\/login\?next=%2Finsights$/);
  await expect(page.getByRole("heading", { name: "Bienvenida" })).toBeVisible();
});

test("una cuenta aprovisionada accede, conserva el destino y cierra la sesión", async ({ page }) => {
  test.skip(!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD, "Requiere credenciales de prueba aprovisionadas.");
  await page.goto("/login?next=%2Finsights");
  await page.getByLabel("Correo").fill(process.env.E2E_USER_EMAIL!);
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/insights");
  await expect(page.getByRole("heading", { name: "Insights", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/insights");
  await expect(page).toHaveURL(/\/login\?next=%2Finsights$/);
});
