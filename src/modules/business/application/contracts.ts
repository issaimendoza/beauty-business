export interface StaffAgreementView {
  id: string;
  name: string;
  kind: "owner" | "employee" | "professional" | "other";
  active: boolean;
  phone: string | null;
  specialty: string | null;
  notes: string | null;
  materialsOwner: "salon" | "professional" | "shared";
  toolsOwner: "salon" | "professional" | "shared";
  agreementId: string | null;
  agreementKind: "percentage" | "employee" | "owner" | "manual" | null;
  salonShareBps: number | null;
  professionalShareBps: number | null;
  agreementEffectiveFrom: Date | null;
}

export interface ServiceView {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  normalizedCategory: string;
  description: string | null;
  listPriceMinor: number;
  durationMinutes: number;
  active: boolean;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface VisitLineDraft {
  serviceId?: string;
  adHocServiceName?: string;
  adHocCategory?: string;
  professionalId: string;
  finalPriceMinor?: number;
  finalSalonMinor?: number;
  finalProfessionalMinor?: number;
  priceAdjustmentReason?: string;
  splitAdjustmentReason?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface PreparedVisitLine {
  serviceId: string | null;
  professionalId: string;
  serviceNameSnapshot: string;
  categorySnapshot: string | null;
  professionalNameSnapshot: string;
  listPriceMinorSnapshot: number;
  durationMinutesSnapshot: number;
  suggestedPriceMinor: number;
  finalPriceMinor: number;
  priceAdjustmentReason: string | null;
  agreementKindSnapshot: string;
  salonShareBpsSnapshot: number;
  professionalShareBpsSnapshot: number;
  suggestedSalonMinor: number;
  suggestedProfessionalMinor: number;
  finalSalonMinor: number;
  finalProfessionalMinor: number;
  splitAdjustmentReason: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  pendingCatalogCompletion: boolean;
}

export interface InsightsFilters {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  professionalId?: string;
  serviceId?: string;
  serviceCategory?: string;
  paymentMethod?: string;
  paymentReceiver?: string;
  source?: string;
  customerKind?: string;
  expenseCategoryId?: string;
  productId?: string;
  vendorId?: string;
  lostReason?: string;
  priceAdjustmentReason?: string;
  splitAdjustmentReason?: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  changePercent: number | null;
}

export interface InsightsResult {
  range: { startDate: string; endDate: string };
  metrics: {
    grossIncome: MetricComparison;
    salonIncome: MetricComparison;
    professionalPayments: MetricComparison;
    expenses: MetricComparison;
    preliminaryResult: MetricComparison;
    visits: MetricComparison;
    services: MetricComparison;
    averageTicket: MetricComparison;
    averageDurationMinutes: MetricComparison;
    lostOpportunities: MetricComparison;
    estimatedLost: MetricComparison;
  };
  daily: Array<{ label: string; incomeMinor: number; expenseMinor: number; visits: number }>;
  byPaymentMethod: Array<{ label: string; valueMinor: number }>;
  byPaymentFlow: Array<{ method: string; receiver: string; valueMinor: number }>;
  byProfessional: Array<{ id: string; label: string; valueMinor: number; salonMinor: number; professionalMinor: number; visits: number }>;
  byService: Array<{ id: string; label: string; valueMinor: number; salonMinor: number; professionalMinor: number; visits: number; averageDurationMinutes: number }>;
  byExpenseCategory: Array<{ id: string; label: string; valueMinor: number }>;
  byExpenseKind: Array<{ label: string; valueMinor: number }>;
  byVendor: Array<{ id: string; label: string; valueMinor: number }>;
  byProduct: Array<{ id: string; label: string; valueMinor: number }>;
  byReceiver: Array<{ label: string; valueMinor: number }>;
  bySource: Array<{ label: string; valueMinor: number; visits: number }>;
  byCustomerKind: Array<{ label: string; visits: number }>;
  byLostReason: Array<{ label: string; opportunities: number; estimatedMinor: number }>;
  byLostService: Array<{ id: string; label: string; opportunities: number; estimatedMinor: number }>;
  byLostChannel: Array<{ label: string; opportunities: number }>;
  lostByCustomerKind: Array<{ label: string; opportunities: number }>;
  activityByWeekdayHour: Array<{ weekday: number; hour: number; services: number; valueMinor: number }>;
  adjustments: Array<{ type: "price" | "split"; label: string; count: number; differenceMinor: number }>;
  closureQuality: Array<{ label: string; days: number; differenceMinor: number }>;
  recentVisits: Array<{ id: string; occurredAt: string; customerName: string | null; totalMinor: number; paymentMethod: string }>;
  recentExpenses: Array<{ id: string; occurredAt: string; description: string; amountMinor: number; paymentMethod: string }>;
  recentLostOpportunities: Array<{ id: string; occurredAt: string; service: string; reason: string; estimatedMinor: number }>;
}

export type InsightDetailKind = "visits" | "expenses" | "lost";

export interface InsightDetailItem {
  id: string;
  occurredAt: string;
  concept: string;
  amountMinor: number;
  dimension: string;
}

export interface InsightDetailPage {
  items: InsightDetailItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface DailyClosePreview {
  businessDate: string;
  grossMinor: number;
  salonMinor: number;
  cashMinor: number;
  transferMinor: number;
  cardMinor: number;
  expensesMinor: number;
  visitCount: number;
  expenseCount: number;
  existingStatus: "balanced" | "difference" | "incomplete" | "pending";
}
