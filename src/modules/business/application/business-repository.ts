import type {
  InsightsFilters,
  InsightsResult,
  InsightDetailItem,
  InsightDetailKind,
  DailyClosePreview,
  PreparedVisitLine,
  ServiceView,
  StaffAgreementView,
} from "@/modules/business/application/contracts";

export interface ServiceCursorPosition {
  normalizedName: string;
  id: string;
}

export interface BusinessRepository {
  listStaff(includeInactive?: boolean): Promise<StaffAgreementView[]>;
  createStaff(input: {
    name: string;
    kind: StaffAgreementView["kind"];
    specialty?: string;
    phone?: string;
    notes?: string;
    materialsOwner: StaffAgreementView["materialsOwner"];
    toolsOwner: StaffAgreementView["toolsOwner"];
    agreementKind: NonNullable<StaffAgreementView["agreementKind"]>;
    salonShareBps: number;
    professionalShareBps: number;
    effectiveFrom: Date;
  }): Promise<string>;
  updateStaff(id: string, input: {
    name: string;
    kind: StaffAgreementView["kind"];
    specialty?: string;
    phone?: string;
    notes?: string;
    materialsOwner: StaffAgreementView["materialsOwner"];
    toolsOwner: StaffAgreementView["toolsOwner"];
    agreementKind: NonNullable<StaffAgreementView["agreementKind"]>;
    salonShareBps: number;
    professionalShareBps: number;
    effectiveFrom: Date;
  }): Promise<void>;
  toggleStaff(id: string): Promise<void>;
  listServices(input: { query: string; limit: number; cursor?: ServiceCursorPosition; includeInactive?: boolean }): Promise<ServiceView[]>;
  findService(id: string): Promise<ServiceView | null>;
  createService(input: Omit<ServiceView, "id" | "active" | "normalizedName" | "normalizedCategory"> & { normalizedName: string; normalizedCategory: string }): Promise<string>;
  updateService(id: string, input: Omit<ServiceView, "id" | "active" | "normalizedName" | "normalizedCategory"> & { normalizedName: string; normalizedCategory: string }): Promise<void>;
  toggleService(id: string): Promise<void>;
  listPendingServices(): Promise<Array<{ lineId: string; name: string; category: string | null; occurredAt: Date }>>;
  completePendingService(lineId: string, input: Omit<ServiceView, "id" | "active" | "normalizedName" | "normalizedCategory"> & { normalizedName: string; normalizedCategory: string }): Promise<string>;
  createAuxiliary(input: { type: "product" | "vendor" | "expenseCategory"; name: string; normalizedName: string }): Promise<string>;
  toggleAuxiliary(type: "product" | "vendor" | "expenseCategory", id: string): Promise<void>;
  listAuxiliaries(): Promise<{ products: Array<{ id: string; name: string; active: boolean }>; vendors: Array<{ id: string; name: string; active: boolean }>; expenseCategories: Array<{ id: string; name: string; active: boolean }> }>;
  createVisit(input: { occurredAt: Date; customerName?: string; customerKind: "new" | "returning" | "unspecified"; source?: string; paymentMethod: "cash" | "card" | "transfer" | "other"; paymentReceiver: "salon" | "professional" | "unknown"; receivedByStaffId?: string; notes?: string; createdByUserId: string; lines: PreparedVisitLine[] }): Promise<string>;
  createExpense(input: { occurredAt: Date; kind: "purchase" | "operational"; description: string; amountMinor: number; paymentMethod: "cash" | "card" | "transfer" | "other"; categoryId: string; vendorId?: string; productId?: string; quantity?: number; unit?: string; unitCostMinor?: number; receiptReference?: string; notes?: string; createdByUserId: string }): Promise<string>;
  createLostOpportunity(input: { occurredAt: Date; requestedAt?: Date; requestedServiceId?: string; requestedServiceSnapshot: string; estimatedAmountMinor?: number; reason: "no_availability" | "service_unavailable" | "price" | "client_cancelled" | "no_show" | "schedule" | "no_response" | "other"; channel?: string; customerKind: "new" | "returning" | "unspecified"; detail?: string; source?: string; createdByUserId: string }): Promise<string>;
  getDayPreview(businessDate: string, timezone: string): Promise<DailyClosePreview>;
  closeDay(input: { businessDate: string; physicalCashMinor: number; hasMissingSales: boolean; hasMissingExpenses: boolean; notes?: string; closedByUserId: string; timezone: string }): Promise<{ status: "balanced" | "difference" | "incomplete"; differenceMinor: number; warnings: string[] }>;
  getInsights(filters: InsightsFilters, timezone: string): Promise<InsightsResult>;
  getInsightDetails(filters: InsightsFilters, timezone: string, kind: InsightDetailKind, cursor: { occurredAt: string; id: string } | undefined, limit: number): Promise<InsightDetailItem[]>;
}
