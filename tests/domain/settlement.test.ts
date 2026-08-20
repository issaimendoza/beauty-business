import { describe, expect, it } from "vitest";

import { assertFinalSettlement, suggestSettlement } from "@/modules/visits/domain/settlement";

describe("suggestSettlement", () => {
  it("mantiene el total aun cuando el redondeo no es exacto", () => {
    const result = suggestSettlement(10_001, 3333);
    expect(result.salonMinor + result.professionalMinor).toBe(10_001);
    expect(result.priceMinor).toBe(10_001);
  });

  it("rechaza porcentajes fuera de rango", () => {
    expect(() => suggestSettlement(10_000, 10_001)).toThrow(/porcentaje/i);
  });
});

describe("assertFinalSettlement", () => {
  const suggested = suggestSettlement(10_000, 5000);

  it("acepta la sugerencia sin explicaciones", () => {
    expect(() =>
      assertFinalSettlement({
        suggested,
        finalPriceMinor: 10_000,
        finalSalonMinor: 5_000,
        finalProfessionalMinor: 5_000,
      }),
    ).not.toThrow();
  });

  it("exige razón al cambiar el precio", () => {
    expect(() =>
      assertFinalSettlement({
        suggested,
        finalPriceMinor: 9_000,
        finalSalonMinor: 4_500,
        finalProfessionalMinor: 4_500,
      }),
    ).toThrow(/precio final/i);
  });

  it("exige razón al cambiar el reparto", () => {
    expect(() =>
      assertFinalSettlement({
        suggested,
        finalPriceMinor: 10_000,
        finalSalonMinor: 4_000,
        finalProfessionalMinor: 6_000,
      }),
    ).toThrow(/reparto final/i);
  });
});
