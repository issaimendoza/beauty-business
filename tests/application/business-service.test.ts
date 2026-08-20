import { describe, expect, it, vi } from "vitest";

import type { BusinessRepository } from "@/modules/business/application/business-repository";
import { BusinessService } from "@/modules/business/application/business-service";

function repository(overrides: Partial<BusinessRepository> = {}): BusinessRepository {
  return {
    listStaff: vi.fn().mockResolvedValue([]),
    createStaff: vi.fn(),
    updateStaff: vi.fn(),
    toggleStaff: vi.fn(),
    listServices: vi.fn().mockResolvedValue([]),
    findService: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    toggleService: vi.fn(),
    listPendingServices: vi.fn(),
    completePendingService: vi.fn(),
    createAuxiliary: vi.fn(),
    toggleAuxiliary: vi.fn(),
    listAuxiliaries: vi.fn(),
    createVisit: vi.fn(),
    createExpense: vi.fn(),
    createLostOpportunity: vi.fn(),
    getDayPreview: vi.fn(),
    closeDay: vi.fn(),
    getInsights: vi.fn(),
    getInsightDetails: vi.fn(),
    ...overrides,
  };
}

describe("BusinessService", () => {
  it("limita la página de servicios a 50 y genera cursor sin exponer estructura", async () => {
    const rows = Array.from({ length: 51 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      name: `Servicio ${index}`,
      normalizedName: `servicio ${String(index).padStart(2, "0")}`,
      category: "General",
      listPriceMinor: 1000,
      durationMinutes: 30,
      active: true,
    }));
    const fakeRepository = repository({ listServices: vi.fn().mockResolvedValue(rows) });
    const service = new BusinessService(fakeRepository, "America/Mexico_City");
    const result = await service.listServices({ limit: 500, query: "Servicio" });
    expect(result.items).toHaveLength(50);
    expect(result.nextCursor).toBeTruthy();
    expect(fakeRepository.listServices).toHaveBeenCalledWith(expect.objectContaining({ limit: 51, query: "servicio" }));
  });

  it("rechaza reutilizar un cursor con otra consulta", async () => {
    const row = {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Corte",
      normalizedName: "corte",
      category: "Cabello",
      listPriceMinor: 1000,
      durationMinutes: 30,
      active: true,
    };
    const fakeRepository = repository({ listServices: vi.fn().mockResolvedValue([row, row]) });
    const service = new BusinessService(fakeRepository, "America/Mexico_City");
    const first = await service.listServices({ limit: 1, query: "corte" });
    await expect(service.listServices({ limit: 1, query: "uñas", cursor: first.nextCursor! })).rejects.toThrow(/cursor/i);
  });

  it("calcula rangos comparables con la misma cantidad de días", () => {
    const service = new BusinessService(repository(), "America/Mexico_City");
    const range = service.resolveInsightsRange({ period: "custom", startDate: "2026-08-10", endDate: "2026-08-12" });
    expect(range).toEqual({
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      previousStartDate: "2026-08-07",
      previousEndDate: "2026-08-09",
    });
  });

  it("recalcula el reparto sugerido sobre el precio final sin exigir un segundo ajuste", async () => {
    const createVisit = vi.fn().mockResolvedValue("visit-id");
    const fakeRepository = repository({
      listStaff: vi.fn().mockResolvedValue([{
        id: "00000000-0000-4000-8000-000000000010",
        name: "Daniela",
        kind: "professional",
        active: true,
        phone: null,
        specialty: null,
        notes: null,
        materialsOwner: "professional",
        toolsOwner: "professional",
        agreementId: "00000000-0000-4000-8000-000000000011",
        agreementKind: "percentage",
        salonShareBps: 5000,
        professionalShareBps: 5000,
        agreementEffectiveFrom: new Date("2026-01-01"),
      }]),
      findService: vi.fn().mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000020",
        name: "Gelish",
        normalizedName: "gelish",
        category: "Uñas",
        normalizedCategory: "unas",
        description: null,
        listPriceMinor: 10_000,
        durationMinutes: 60,
        active: true,
      }),
      createVisit,
    });
    const service = new BusinessService(fakeRepository, "America/Mexico_City");
    await service.createVisit({
      occurredAt: "2026-08-19T18:00:00Z",
      customerKind: "returning",
      paymentMethod: "cash",
      paymentReceiver: "salon",
      lines: [{
        serviceId: "00000000-0000-4000-8000-000000000020",
        professionalId: "00000000-0000-4000-8000-000000000010",
        finalPriceMinor: 9_000,
        finalSalonMinor: 4_500,
        finalProfessionalMinor: 4_500,
        priceAdjustmentReason: "promotion",
      }],
    }, "user-id");
    expect(createVisit).toHaveBeenCalledWith(expect.objectContaining({
      lines: [expect.objectContaining({
        suggestedPriceMinor: 10_000,
        suggestedSalonMinor: 4_500,
        suggestedProfessionalMinor: 4_500,
        splitAdjustmentReason: null,
      })],
    }));
  });

  it("pagina el detalle de Insights y vincula el cursor a su fuente y filtros", async () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      occurredAt: new Date(2026, 7, 19, 12, 0, 21 - index).toISOString(),
      concept: `Servicio ${index}`,
      amountMinor: 1_000,
      dimension: "cash · salon",
    }));
    const fakeRepository = repository({ getInsightDetails: vi.fn().mockResolvedValue(rows) });
    const service = new BusinessService(fakeRepository, "America/Mexico_City");
    const first = await service.getInsightDetails({ kind: "visits", period: "custom", startDate: "2026-08-19", endDate: "2026-08-19", limit: 20 });
    expect(first.items).toHaveLength(20);
    expect(first.hasNextPage).toBe(true);
    await expect(service.getInsightDetails({ kind: "expenses", period: "custom", startDate: "2026-08-19", endDate: "2026-08-19", cursor: first.nextCursor! })).rejects.toThrow(/cursor/i);
  });
});
