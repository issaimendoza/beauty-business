import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  test.skip(!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD, "Requiere credenciales de prueba aprovisionadas.");
  await page.goto("/login");
  await page.getByLabel("Correo").fill(process.env.E2E_USER_EMAIL!);
  await page.getByRole("textbox", { name: "Contraseña", exact: true }).fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/", { timeout: 20_000 });
}

async function api<T>(page: Page, url: string, body?: unknown, method = "POST"): Promise<T> {
  return page.evaluate(
    async ({ endpoint, payload, requestMethod }) => {
      const response = await fetch(endpoint, payload === undefined ? undefined : {
        method: requestMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const envelope = await response.json();
      if (!response.ok) throw new Error(envelope.error?.message ?? `HTTP ${response.status}`);
      return envelope.data;
    },
    { endpoint: url, payload: body, requestMethod: method },
  );
}

test("recorrido integrado de catálogos, operación, finanzas, cierre e Insights", async ({ page }) => {
  await login(page);
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  const staff = await api<{ id: string }>(page, "/api/staff", {
    name: `Colaboradora E2E ${suffix}`,
    kind: "professional",
    materialsOwner: "professional",
    toolsOwner: "professional",
    agreementKind: "percentage",
    salonSharePercent: 40,
    effectiveFrom: new Date().toISOString(),
  });
  const service = await api<{ id: string }>(page, "/api/services", {
    name: `Servicio E2E ${suffix}`,
    category: "Pruebas",
    listPriceMinor: 25_000,
    durationMinutes: 60,
  });
  const suggestion = await api<{ priceMinor: number; salonMinor: number; professionalMinor: number }>(
    page,
    `/api/settlement-suggestion?serviceId=${service.id}&professionalId=${staff.id}`,
  );
  expect(suggestion).toMatchObject({ priceMinor: 25_000, salonMinor: 10_000, professionalMinor: 15_000 });

  const occurredAt = new Date().toISOString();
  const visit = await api<{ id: string }>(page, "/api/visits", {
    occurredAt,
    customerName: "Cliente E2E",
    customerKind: "new",
    source: "E2E",
    paymentMethod: "cash",
    paymentReceiver: "salon",
    receivedByStaffId: staff.id,
    lines: [{
      serviceId: service.id,
      professionalId: staff.id,
      finalPriceMinor: suggestion.priceMinor,
      finalSalonMinor: suggestion.salonMinor,
      finalProfessionalMinor: suggestion.professionalMinor,
    }],
  });
  expect(visit.id).toBeTruthy();

  await api(page, `/api/services/${service.id}`, {
    name: `Servicio E2E ${suffix}`,
    category: "Pruebas actualizadas",
    description: "Editado después de la visita",
    listPriceMinor: 30_000,
    durationMinutes: 75,
  }, "PUT");
  await api(page, `/api/staff/${staff.id}`, {
    name: `Colaboradora E2E ${suffix}`,
    kind: "professional",
    specialty: "E2E",
    materialsOwner: "professional",
    toolsOwner: "professional",
    agreementKind: "percentage",
    salonSharePercent: 45,
    effectiveFrom: new Date().toISOString(),
  }, "PUT");
  const updatedSuggestion = await api<{ priceMinor: number; salonMinor: number; professionalMinor: number }>(page, `/api/settlement-suggestion?serviceId=${service.id}&professionalId=${staff.id}`);
  expect(updatedSuggestion).toMatchObject({ priceMinor: 30_000, salonMinor: 13_500, professionalMinor: 16_500 });

  const pendingName = `Temporal E2E ${suffix}`;
  await api(page, "/api/visits", {
    occurredAt,
    customerKind: "unspecified",
    source: "unknown",
    paymentMethod: "cash",
    paymentReceiver: "salon",
    lines: [{ adHocServiceName: pendingName, adHocCategory: "Temporal", professionalId: staff.id, finalPriceMinor: 10_000, finalSalonMinor: 4_500, finalProfessionalMinor: 5_500 }],
  });
  const pending = await api<Array<{lineId:string;name:string}>>(page, "/api/services/pending");
  const pendingLine = pending.find((item)=>item.name===pendingName);
  expect(pendingLine).toBeTruthy();
  await api(page, "/api/services/pending", { lineId: pendingLine!.lineId, name: pendingName, category: "Temporal completa", listPriceMinor: 10_000, durationMinutes: 45 });

  const expenseCategory = await api<{ id: string }>(page, "/api/auxiliaries", { type: "expenseCategory", name: `Categoría E2E ${suffix}` });
  const vendor = await api<{ id: string }>(page, "/api/auxiliaries", { type: "vendor", name: `Proveedor E2E ${suffix}` });
  const product = await api<{ id: string }>(page, "/api/auxiliaries", { type: "product", name: `Producto E2E ${suffix}` });
  await api(page, "/api/expenses", {
    occurredAt,
    kind: "purchase",
    description: "Compra E2E",
    amountMinor: 1_234,
    paymentMethod: "cash",
    categoryId: expenseCategory.id,
    vendorId: vendor.id,
    productId: product.id,
    quantity: 1,
    unit: "pieza",
    unitCostMinor: 1_234,
    receiptReference: `E2E-${suffix}`,
  });
  await api(page, "/api/lost-opportunities", {
    occurredAt,
    requestedServiceId: service.id,
    requestedServiceSnapshot: `Servicio E2E ${suffix}`,
    estimatedAmountMinor: 25_000,
    reason: "no_availability",
    channel: "whatsapp",
    customerKind: "new",
    source: "E2E",
  });

  const businessDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const closure = await api<{ differenceMinor: number; status: string }>(page, "/api/daily-closures", {
    businessDate,
    physicalCashMinor: 25_000,
    notes: "Cierre E2E",
  });
  expect(["balanced", "difference", "incomplete"]).toContain(closure.status);

  const insights = await api<{ metrics: { grossIncome: { current: number }; expenses: { current: number }; lostOpportunities: { current: number } } }>(page, `/api/insights?period=custom&startDate=${businessDate}&endDate=${businessDate}`);
  expect(insights.metrics.grossIncome.current).toBeGreaterThanOrEqual(35_000);
  expect(insights.metrics.expenses.current).toBeGreaterThanOrEqual(1_234);
  expect(insights.metrics.lostOpportunities.current).toBeGreaterThanOrEqual(1);

  const serviceFiltered = await api<{ metrics: { grossIncome: { current: number }; visits: { current: number }; services: { current: number }; lostOpportunities: { current: number } } }>(page, `/api/insights?period=custom&startDate=${businessDate}&endDate=${businessDate}&serviceId=${service.id}`);
  expect(serviceFiltered.metrics.grossIncome.current).toBe(25_000);
  expect(serviceFiltered.metrics.visits.current).toBe(1);
  expect(serviceFiltered.metrics.services.current).toBe(1);
  expect(serviceFiltered.metrics.lostOpportunities.current).toBe(1);

  const expenseFiltered = await api<{ metrics: { expenses: { current: number } } }>(page, `/api/insights?period=custom&startDate=${businessDate}&endDate=${businessDate}&expenseCategoryId=${expenseCategory.id}&vendorId=${vendor.id}&productId=${product.id}`);
  expect(expenseFiltered.metrics.expenses.current).toBe(1_234);
  const detail = await api<{ items: Array<{ id: string; amountMinor: number }>; hasNextPage: boolean }>(page, `/api/insights/details?kind=visits&period=custom&startDate=${businessDate}&endDate=${businessDate}&serviceId=${service.id}&limit=20`);
  expect(detail.items).toEqual(expect.arrayContaining([expect.objectContaining({ id: visit.id, amountMinor: 25_000 })]));

  await page.goto("/insights");
  await expect(page.getByRole("heading", { name: "Insights", exact: true })).toBeVisible();
  await expect(page.getByText("Resultado preliminar", { exact: true })).toBeVisible();
});

test("crea un servicio desde la visita sin que el buscador cubra el alta", async ({ page }) => {
  await login(page);
  await page.goto("/servicios/registrar");

  const serviceName = `Servicio contextual ${Date.now()}`;
  const serviceCombobox = page.getByRole("combobox", { name: "Servicio", exact: true });

  await expect(page.getByRole("listbox")).toHaveCount(0);
  await serviceCombobox.fill(serviceName);
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByText("No encontramos servicios.", { exact: true })).toBeVisible();

  await page.getByRole("heading", { name: "Servicio 1", exact: true }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);

  await serviceCombobox.click();
  await page.getByRole("button", { name: new RegExp(`Agregar .*${serviceName}.* al catálogo`) }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByText(`Agregar “${serviceName}” al catálogo`, { exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: "Categoría del servicio", exact: true }).fill("Pruebas de interfaz");
  await page.getByRole("spinbutton", { name: "Precio de lista", exact: true }).fill("275");
  await page.getByRole("spinbutton", { name: "Duración estimada", exact: true }).fill("45");
  await page.getByRole("button", { name: "Guardar y seleccionar", exact: true }).click();

  await expect(page.getByText("Servicio agregado y seleccionado", { exact: true })).toBeVisible();
  await expect(serviceCombobox).toHaveValue(serviceName);
  await expect(page.getByText(`Agregar “${serviceName}” al catálogo`, { exact: true })).toHaveCount(0);
});
