import { addDays, differenceInCalendarDays, format, startOfMonth, startOfWeek, startOfYear, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";

import type { BusinessRepository } from "@/modules/business/application/business-repository";
import type { InsightDetailKind, InsightsFilters, VisitLineDraft } from "@/modules/business/application/contracts";
import { assertFinalSettlement, suggestSettlement } from "@/modules/visits/domain/settlement";
import { normalizeCatalogName } from "@/shared/domain/text";

const uuid = z.uuid("Identificador inválido.");
const name = z.string().trim().min(2).max(120);
const payment = z.enum(["cash", "card", "transfer", "other"]);
const priceAdjustmentReasons = ["promotion", "negotiated_price", "courtesy", "rework_or_complaint", "extra_work_or_material", "package", "staff_or_family"];
const splitAdjustmentReasons = ["session_agreement", "materials_or_tools", "rework_or_complaint", "correction"];

function assertNormalizedReason(reason: string | undefined, allowed: string[], label: string) {
  if (!reason || (!allowed.includes(reason) && !/^other:.{3,}$/i.test(reason))) {
    throw new Error(`Selecciona un motivo válido para el ${label}; Otro requiere una explicación.`);
  }
}

function encodeCursor(value: { version: 1; normalizedName: string; id: string; query: string; status: "all" | "active" }) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(value: string | undefined, query: string, status: "all" | "active") {
  if (!value) return undefined;
  try {
    const parsed = z
      .object({ version: z.literal(1), normalizedName: z.string(), id: z.uuid(), query: z.string(), status: z.enum(["all", "active"]) })
      .parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    if (parsed.query !== query || parsed.status !== status) throw new Error("Consulta diferente");
    return { normalizedName: parsed.normalizedName, id: parsed.id };
  } catch {
    throw new Error("El cursor de paginación ya no es válido. Reinicia la búsqueda.");
  }
}

function currentDateInTimezone(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateOnly(value: Date) {
  return format(value, "yyyy-MM-dd");
}

type InsightsInput = {
  period?: string; startDate?: string; endDate?: string; professionalId?: string; serviceId?: string; serviceCategory?: string;
  paymentMethod?: string; paymentReceiver?: string; source?: string; customerKind?: string; expenseCategoryId?: string;
  productId?: string; vendorId?: string; lostReason?: string; priceAdjustmentReason?: string; splitAdjustmentReason?: string;
};

export class BusinessService {
  constructor(
    private readonly repository: BusinessRepository,
    private readonly timezone: string,
  ) {}

  listStaff(includeInactive = false) {
    return this.repository.listStaff(includeInactive);
  }

  async createStaff(input: unknown) {
    const parsed = z
      .object({
        name,
        kind: z.enum(["owner", "employee", "professional", "other"]),
        specialty: z.string().trim().max(120).optional(),
        phone: z.string().trim().max(40).optional(),
        notes: z.string().trim().max(500).optional(),
        materialsOwner: z.enum(["salon", "professional", "shared"]),
        toolsOwner: z.enum(["salon", "professional", "shared"]),
        agreementKind: z.enum(["percentage", "employee", "owner", "manual"]),
        salonSharePercent: z.coerce.number().min(0).max(100),
        effectiveFrom: z.coerce.date(),
      })
      .parse(input);
    const salonShareBps = Math.round(parsed.salonSharePercent * 100);
    return this.repository.createStaff({
      ...parsed,
      salonShareBps,
      professionalShareBps: 10_000 - salonShareBps,
    });
  }

  async updateStaff(id: string, input: unknown) {
    const parsed = z
      .object({
        name,
        kind: z.enum(["owner", "employee", "professional", "other"]),
        specialty: z.string().trim().max(120).optional(),
        phone: z.string().trim().max(40).optional(),
        notes: z.string().trim().max(500).optional(),
        materialsOwner: z.enum(["salon", "professional", "shared"]),
        toolsOwner: z.enum(["salon", "professional", "shared"]),
        agreementKind: z.enum(["percentage", "employee", "owner", "manual"]),
        salonSharePercent: z.coerce.number().min(0).max(100),
        effectiveFrom: z.coerce.date(),
      })
      .parse(input);
    const salonShareBps = Math.round(parsed.salonSharePercent * 100);
    await this.repository.updateStaff(uuid.parse(id), {
      ...parsed,
      salonShareBps,
      professionalShareBps: 10_000 - salonShareBps,
    });
  }

  async toggleStaff(id: string) {
    return this.repository.toggleStaff(uuid.parse(id));
  }

  async listServices(input: { query?: string; cursor?: string; limit?: number; includeInactive?: boolean }) {
    const query = normalizeCatalogName(input.query ?? "");
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    const status = input.includeInactive ? "all" : "active";
    const cursor = decodeCursor(input.cursor, query, status);
    const rows = await this.repository.listServices({ query, cursor, limit: limit + 1, includeInactive: input.includeInactive });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return {
      items,
      nextCursor: hasMore && last ? encodeCursor({ version: 1, normalizedName: last.normalizedName, id: last.id, query, status }) : null,
      hasNextPage: hasMore,
    };
  }

  async createService(input: unknown) {
    const parsed = z
      .object({
        name,
        category: z.string().trim().min(2).max(80),
        description: z.string().trim().max(500).optional().transform((value) => value || null),
        listPriceMinor: z.coerce.number().int().min(0),
        durationMinutes: z.coerce.number().int().min(5).max(1440),
      })
      .parse(input);
    return this.repository.createService({ ...parsed, normalizedName: normalizeCatalogName(parsed.name), normalizedCategory: normalizeCatalogName(parsed.category) });
  }

  async updateService(id: string, input: unknown) {
    const parsed = z
      .object({
        name,
        category: z.string().trim().min(2).max(80),
        description: z.string().trim().max(500).optional().transform((value) => value || null),
        listPriceMinor: z.coerce.number().int().min(0),
        durationMinutes: z.coerce.number().int().min(5).max(1440),
      })
      .parse(input);
    await this.repository.updateService(uuid.parse(id), { ...parsed, normalizedName: normalizeCatalogName(parsed.name), normalizedCategory: normalizeCatalogName(parsed.category) });
  }

  toggleService(id: string) {
    return this.repository.toggleService(uuid.parse(id));
  }

  listPendingServices() {
    return this.repository.listPendingServices();
  }

  async completePendingService(input: unknown) {
    const parsed = z.object({ lineId: z.uuid(), name, category: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional().transform((value)=>value||null), listPriceMinor: z.coerce.number().int().min(0), durationMinutes: z.coerce.number().int().min(5).max(1440) }).parse(input);
    const { lineId, ...service } = parsed;
    return this.repository.completePendingService(lineId, { ...service, normalizedName: normalizeCatalogName(service.name), normalizedCategory: normalizeCatalogName(service.category) });
  }

  listAuxiliaries() {
    return this.repository.listAuxiliaries();
  }

  async createAuxiliary(input: unknown) {
    const parsed = z.object({ type: z.enum(["product", "vendor", "expenseCategory"]), name }).parse(input);
    return this.repository.createAuxiliary({ ...parsed, normalizedName: normalizeCatalogName(parsed.name) });
  }

  toggleAuxiliary(type: string, id: string) {
    return this.repository.toggleAuxiliary(z.enum(["product", "vendor", "expenseCategory"]).parse(type), uuid.parse(id));
  }

  async getSettlementSuggestion(serviceId: string, professionalId: string) {
    const [service, professionals] = await Promise.all([
      this.repository.findService(uuid.parse(serviceId)),
      this.repository.listStaff(),
    ]);
    const professional = professionals.find((item) => item.id === uuid.parse(professionalId));
    if (!service || !service.active) throw new Error("El servicio ya no está disponible.");
    if (!professional || !professional.active || professional.salonShareBps === null) {
      throw new Error("La colaboradora no tiene un acuerdo vigente.");
    }
    return { service, professional, ...suggestSettlement(service.listPriceMinor, professional.salonShareBps) };
  }

  async createVisit(raw: unknown, userId: string) {
    const input = z
      .object({
        occurredAt: z.coerce.date(),
        customerName: z.string().trim().max(120).optional(),
        customerKind: z.enum(["new", "returning", "unspecified"]).default("unspecified"),
        source: z.string().trim().max(80).optional(),
        paymentMethod: payment,
        paymentReceiver: z.enum(["salon", "professional", "unknown"]),
        receivedByStaffId: z.uuid().optional(),
        notes: z.string().trim().max(500).optional(),
        lines: z.array(z.object({
          serviceId: z.uuid().optional(),
          adHocServiceName: z.string().trim().min(2).max(120).optional(),
          adHocCategory: z.string().trim().max(80).optional(),
          professionalId: z.uuid(),
          finalPriceMinor: z.number().int().min(0).optional(),
          finalSalonMinor: z.number().int().min(0).optional(),
          finalProfessionalMinor: z.number().int().min(0).optional(),
          priceAdjustmentReason: z.string().trim().max(300).optional(),
          splitAdjustmentReason: z.string().trim().max(300).optional(),
          startedAt: z.coerce.date().optional(),
          completedAt: z.coerce.date().optional(),
        }).refine((line) => line.serviceId || line.adHocServiceName, "Selecciona o escribe un servicio.").refine((line) => !line.startedAt || !line.completedAt || line.completedAt >= line.startedAt, "La hora final no puede ser anterior a la inicial.")).min(1),
      })
      .parse(raw);

    const professionals = await this.repository.listStaff();
    const preparedLines = [];
    for (const line of input.lines as VisitLineDraft[]) {
      const professional = professionals.find((item) => item.id === line.professionalId);
      if (!professional || professional.salonShareBps === null || professional.professionalShareBps === null || !professional.agreementKind) {
        throw new Error("Una colaboradora seleccionada no tiene acuerdo vigente.");
      }
      const service = line.serviceId ? await this.repository.findService(line.serviceId) : null;
      if (line.serviceId && (!service || !service.active)) throw new Error("Un servicio seleccionado ya no está disponible.");
      const listPrice = service?.listPriceMinor ?? line.finalPriceMinor ?? 0;
      const chargeSuggestion = suggestSettlement(listPrice, professional.salonShareBps);
      const finalPriceMinor = line.finalPriceMinor ?? chargeSuggestion.priceMinor;
      const splitSuggestion = suggestSettlement(finalPriceMinor, professional.salonShareBps);
      const suggestion = { ...chargeSuggestion, salonMinor: splitSuggestion.salonMinor, professionalMinor: splitSuggestion.professionalMinor };
      const finalSalonMinor = line.finalSalonMinor ?? suggestion.salonMinor;
      const finalProfessionalMinor = line.finalProfessionalMinor ?? suggestion.professionalMinor;
      if (finalPriceMinor !== suggestion.priceMinor) assertNormalizedReason(line.priceAdjustmentReason, priceAdjustmentReasons, "cambio de precio");
      if (finalSalonMinor !== suggestion.salonMinor || finalProfessionalMinor !== suggestion.professionalMinor) assertNormalizedReason(line.splitAdjustmentReason, splitAdjustmentReasons, "cambio de reparto");
      assertFinalSettlement({ suggested: suggestion, finalPriceMinor, finalSalonMinor, finalProfessionalMinor, priceAdjustmentReason: line.priceAdjustmentReason, splitAdjustmentReason: line.splitAdjustmentReason });
      preparedLines.push({
        serviceId: service?.id ?? null,
        professionalId: professional.id,
        serviceNameSnapshot: service?.name ?? line.adHocServiceName!.trim(),
        categorySnapshot: service?.category ?? line.adHocCategory?.trim() ?? null,
        professionalNameSnapshot: professional.name,
        listPriceMinorSnapshot: listPrice,
        durationMinutesSnapshot: service?.durationMinutes ?? (line.startedAt && line.completedAt ? Math.max(0, Math.round((line.completedAt.getTime() - line.startedAt.getTime()) / 60_000)) : 0),
        suggestedPriceMinor: suggestion.priceMinor,
        finalPriceMinor,
        priceAdjustmentReason: line.priceAdjustmentReason?.trim() || null,
        agreementKindSnapshot: professional.agreementKind,
        salonShareBpsSnapshot: professional.salonShareBps,
        professionalShareBpsSnapshot: professional.professionalShareBps,
        suggestedSalonMinor: suggestion.salonMinor,
        suggestedProfessionalMinor: suggestion.professionalMinor,
        finalSalonMinor,
        finalProfessionalMinor,
        splitAdjustmentReason: line.splitAdjustmentReason?.trim() || null,
        startedAt: line.startedAt ?? null,
        completedAt: line.completedAt ?? null,
        pendingCatalogCompletion: !service,
      });
    }
    return this.repository.createVisit({ ...input, createdByUserId: userId, lines: preparedLines });
  }

  async createExpense(raw: unknown, userId: string) {
    const input = z.object({ occurredAt: z.coerce.date(), kind: z.enum(["purchase", "operational"]), description: name, amountMinor: z.coerce.number().int().positive(), paymentMethod: payment, categoryId: z.uuid(), vendorId: z.uuid().optional(), productId: z.uuid().optional(), quantity: z.coerce.number().int().positive().optional(), unit: z.string().trim().max(40).optional(), unitCostMinor: z.coerce.number().int().min(0).optional(), receiptReference: z.string().trim().max(300).optional(), notes: z.string().trim().max(500).optional() }).parse(raw);
    if (input.kind === "purchase" && !input.productId) throw new Error("Selecciona el producto de la compra.");
    return this.repository.createExpense({ ...input, createdByUserId: userId });
  }

  async createLostOpportunity(raw: unknown, userId: string) {
    const input = z.object({ occurredAt: z.coerce.date(), requestedAt: z.coerce.date().optional(), requestedServiceId: z.uuid().optional(), requestedServiceSnapshot: name, estimatedAmountMinor: z.coerce.number().int().min(0).optional(), reason: z.enum(["no_availability", "service_unavailable", "price", "client_cancelled", "no_show", "schedule", "no_response", "other"]), channel: z.string().trim().max(80).optional(), customerKind: z.enum(["new", "returning", "unspecified"]).default("unspecified"), detail: z.string().trim().max(500).optional(), source: z.string().trim().max(80).optional() }).parse(raw);
    return this.repository.createLostOpportunity({ ...input, createdByUserId: userId });
  }

  closeDay(raw: unknown, userId: string) {
    const input = z.object({ businessDate: z.iso.date(), physicalCashMinor: z.coerce.number().int().min(0), hasMissingSales: z.boolean().default(false), hasMissingExpenses: z.boolean().default(false), notes: z.string().trim().max(500).optional() }).parse(raw);
    return this.repository.closeDay({ ...input, closedByUserId: userId, timezone: this.timezone });
  }

  getDayPreview(businessDate: string) {
    return this.repository.getDayPreview(z.iso.date().parse(businessDate), this.timezone);
  }

  resolveInsightsRange(input: { period?: string; startDate?: string; endDate?: string }): InsightsFilters {
    const today = currentDateInTimezone(this.timezone);
    const todayDate = new Date(`${today}T12:00:00Z`);
    let start = todayDate;
    let end = todayDate;
    switch (input.period) {
      case "day": break;
      case "week": start = startOfWeek(todayDate, { locale: es, weekStartsOn: 1 }); break;
      case "year": start = startOfYear(todayDate); break;
      case "last30": start = subDays(todayDate, 29); break;
      case "custom":
        start = new Date(`${z.iso.date().parse(input.startDate)}T12:00:00Z`);
        end = new Date(`${z.iso.date().parse(input.endDate)}T12:00:00Z`);
        break;
      case "month":
      default: start = startOfMonth(todayDate);
    }
    if (start > end) throw new Error("La fecha inicial debe ser anterior a la final.");
    const days = differenceInCalendarDays(end, start) + 1;
    const previousEnd = subDays(start, 1);
    const previousStart = addDays(previousEnd, -(days - 1));
    return { startDate: dateOnly(start), endDate: dateOnly(end), previousStartDate: dateOnly(previousStart), previousEndDate: dateOnly(previousEnd) };
  }

  private buildInsightsFilters(input: InsightsInput) {
    const range = this.resolveInsightsRange(input);
    const optionalText = (value: string | undefined) => value?.trim() || undefined;
    return {
      ...range,
      professionalId: input.professionalId ? uuid.parse(input.professionalId) : undefined,
      serviceId: input.serviceId ? uuid.parse(input.serviceId) : undefined,
      serviceCategory: optionalText(input.serviceCategory),
      paymentMethod: input.paymentMethod ? payment.parse(input.paymentMethod) : undefined,
      paymentReceiver: input.paymentReceiver ? z.enum(["salon", "professional", "unknown"]).parse(input.paymentReceiver) : undefined,
      source: optionalText(input.source),
      customerKind: input.customerKind ? z.enum(["new", "returning", "unspecified"]).parse(input.customerKind) : undefined,
      expenseCategoryId: input.expenseCategoryId ? uuid.parse(input.expenseCategoryId) : undefined,
      productId: input.productId ? uuid.parse(input.productId) : undefined,
      vendorId: input.vendorId ? uuid.parse(input.vendorId) : undefined,
      lostReason: input.lostReason ? z.enum(["no_availability", "service_unavailable", "price", "client_cancelled", "no_show", "schedule", "no_response", "other"]).parse(input.lostReason) : undefined,
      priceAdjustmentReason: optionalText(input.priceAdjustmentReason),
      splitAdjustmentReason: optionalText(input.splitAdjustmentReason),
    } satisfies InsightsFilters;
  }

  getInsights(input: InsightsInput) {
    return this.repository.getInsights(this.buildInsightsFilters(input), this.timezone);
  }

  async getInsightDetails(input: InsightsInput & { kind?: string; cursor?: string; limit?: number }) {
    const kind = z.enum(["visits", "expenses", "lost"]).parse(input.kind) as InsightDetailKind;
    const filters = this.buildInsightsFilters(input);
    const identity = JSON.stringify(filters);
    let cursor: { occurredAt: string; id: string } | undefined;
    if (input.cursor) {
      try {
        const parsed = z.object({ version: z.literal(1), kind: z.enum(["visits", "expenses", "lost"]), identity: z.string(), occurredAt: z.string().min(1), id: z.uuid() }).parse(JSON.parse(Buffer.from(input.cursor, "base64url").toString("utf8")));
        if (parsed.kind !== kind || parsed.identity !== identity) throw new Error("Consulta diferente");
        cursor = { occurredAt: parsed.occurredAt, id: parsed.id };
      } catch { throw new Error("El cursor del detalle ya no es válido. Vuelve a abrir el detalle."); }
    }
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    const rows = await this.repository.getInsightDetails(filters, this.timezone, kind, cursor, limit + 1);
    const hasNextPage = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return {
      items,
      hasNextPage,
      nextCursor: hasNextPage && last ? Buffer.from(JSON.stringify({ version: 1, kind, identity, occurredAt: last.occurredAt, id: last.id }), "utf8").toString("base64url") : null,
    };
  }
}
