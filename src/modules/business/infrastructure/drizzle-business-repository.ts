import "server-only";

import { and, asc, eq, gt, ilike, isNull, lte, or, sql } from "drizzle-orm";

import type { BusinessRepository, ServiceCursorPosition } from "@/modules/business/application/business-repository";
import type { InsightDetailItem, InsightDetailKind, InsightsFilters, InsightsResult, MetricComparison } from "@/modules/business/application/contracts";
import type { Database } from "@/shared/infrastructure/database/client";
import {
  dailyClosures,
  expenseCategories,
  expenses,
  lostOpportunities,
  products,
  services,
  staff,
  staffAgreements,
  vendors,
  visits,
  visitServices,
} from "@/shared/infrastructure/database/schema";

type NumericRow = Record<string, string | number | null>;

function asNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function comparison(current: number, previous: number): MetricComparison {
  return {
    current,
    previous,
    changePercent: previous === 0 ? (current === 0 ? 0 : null) : ((current - previous) / Math.abs(previous)) * 100,
  };
}

export class DrizzleBusinessRepository implements BusinessRepository {
  constructor(private readonly database: Database) {}

  async listStaff(includeInactive = false) {
    const now = new Date();
    return this.database
      .select({
        id: staff.id,
        name: staff.name,
        kind: staff.kind,
        specialty: staff.specialty,
        active: staff.active,
        phone: staff.phone,
        notes: staff.notes,
        materialsOwner: staff.materialsOwner,
        toolsOwner: staff.toolsOwner,
        agreementId: staffAgreements.id,
        agreementKind: staffAgreements.kind,
        salonShareBps: staffAgreements.salonShareBps,
        professionalShareBps: staffAgreements.professionalShareBps,
        agreementEffectiveFrom: staffAgreements.effectiveFrom,
      })
      .from(staff)
      .leftJoin(staffAgreements, and(eq(staff.id, staffAgreements.staffId), lte(staffAgreements.effectiveFrom, now), or(isNull(staffAgreements.effectiveTo), gt(staffAgreements.effectiveTo, now))))
      .where(includeInactive ? undefined : eq(staff.active, true))
      .orderBy(asc(staff.name), asc(staff.id));
  }

  async createStaff(input: Parameters<BusinessRepository["createStaff"]>[0]) {
    return this.database.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(staff)
        .values({
          name: input.name,
          kind: input.kind,
          specialty: input.specialty || null,
          phone: input.phone || null,
          notes: input.notes || null,
          materialsOwner: input.materialsOwner,
          toolsOwner: input.toolsOwner,
        })
        .returning({ id: staff.id });
      await transaction.insert(staffAgreements).values({
        staffId: created.id,
        kind: input.agreementKind,
        salonShareBps: input.salonShareBps,
        professionalShareBps: input.professionalShareBps,
        effectiveFrom: input.effectiveFrom,
      });
      return created.id;
    });
  }

  async updateStaff(id: string, input: Parameters<BusinessRepository["updateStaff"]>[1]) {
    await this.database.transaction(async (transaction) => {
      await transaction
        .update(staff)
        .set({
          name: input.name,
          kind: input.kind,
          specialty: input.specialty || null,
          phone: input.phone || null,
          notes: input.notes || null,
          materialsOwner: input.materialsOwner,
          toolsOwner: input.toolsOwner,
        })
        .where(eq(staff.id, id));
      await transaction
        .update(staffAgreements)
        .set({ effectiveTo: input.effectiveFrom })
        .where(and(eq(staffAgreements.staffId, id), isNull(staffAgreements.effectiveTo)));
      await transaction.insert(staffAgreements).values({
        staffId: id,
        kind: input.agreementKind,
        salonShareBps: input.salonShareBps,
        professionalShareBps: input.professionalShareBps,
        effectiveFrom: input.effectiveFrom,
      });
    });
  }

  async toggleStaff(id: string) {
    await this.database.update(staff).set({ active: sql`not ${staff.active}` }).where(eq(staff.id, id));
  }

  async listServices(input: { query: string; limit: number; cursor?: ServiceCursorPosition; includeInactive?: boolean }) {
    const filters = [];
    if (!input.includeInactive) filters.push(eq(services.active, true));
    if (input.query) filters.push(or(ilike(services.normalizedName, `%${input.query}%`), ilike(services.normalizedCategory, `%${input.query}%`))!);
    if (input.cursor) {
      filters.push(
        or(
          gt(services.normalizedName, input.cursor.normalizedName),
          and(eq(services.normalizedName, input.cursor.normalizedName), gt(services.id, input.cursor.id)),
        )!,
      );
    }
    return this.database
      .select({
        id: services.id,
        name: services.name,
        normalizedName: services.normalizedName,
        category: services.category,
        normalizedCategory: services.normalizedCategory,
        description: services.description,
        listPriceMinor: services.listPriceMinor,
        durationMinutes: services.durationMinutes,
        active: services.active,
      })
      .from(services)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(services.normalizedName), asc(services.id))
      .limit(input.limit);
  }

  async findService(id: string) {
    const [service] = await this.database
      .select({
        id: services.id,
        name: services.name,
        normalizedName: services.normalizedName,
        category: services.category,
        normalizedCategory: services.normalizedCategory,
        description: services.description,
        listPriceMinor: services.listPriceMinor,
        durationMinutes: services.durationMinutes,
        active: services.active,
      })
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
    return service ?? null;
  }

  async createService(input: Parameters<BusinessRepository["createService"]>[0]) {
    const [created] = await this.database.insert(services).values(input).returning({ id: services.id });
    return created.id;
  }

  async updateService(id: string, input: Parameters<BusinessRepository["updateService"]>[1]) {
    await this.database.update(services).set(input).where(eq(services.id, id));
  }

  async toggleService(id: string) {
    await this.database.update(services).set({ active: sql`not ${services.active}` }).where(eq(services.id, id));
  }

  async listPendingServices() {
    return this.database
      .select({ lineId: visitServices.id, name: visitServices.serviceNameSnapshot, category: visitServices.categorySnapshot, occurredAt: visits.occurredAt })
      .from(visitServices)
      .innerJoin(visits, eq(visits.id, visitServices.visitId))
      .where(eq(visitServices.pendingCatalogCompletion, true))
      .orderBy(asc(visits.occurredAt), asc(visitServices.id));
  }

  async completePendingService(lineId: string, input: Parameters<BusinessRepository["completePendingService"]>[1]) {
    return this.database.transaction(async (transaction) => {
      const [created] = await transaction.insert(services).values(input).returning({ id: services.id });
      await transaction.update(visitServices).set({ serviceId: created.id, pendingCatalogCompletion: false }).where(eq(visitServices.id, lineId));
      return created.id;
    });
  }

  async createAuxiliary(input: Parameters<BusinessRepository["createAuxiliary"]>[0]) {
    const table = input.type === "product" ? products : input.type === "vendor" ? vendors : expenseCategories;
    const [created] = await this.database
      .insert(table)
      .values({ name: input.name, normalizedName: input.normalizedName })
      .returning({ id: table.id });
    return created.id;
  }

  async toggleAuxiliary(type: "product" | "vendor" | "expenseCategory", id: string) {
    const table = type === "product" ? products : type === "vendor" ? vendors : expenseCategories;
    await this.database.update(table).set({ active: sql`not ${table.active}` }).where(eq(table.id, id));
  }

  async listAuxiliaries() {
    const [productRows, vendorRows, categoryRows] = await Promise.all([
      this.database.select({ id: products.id, name: products.name, active: products.active }).from(products).orderBy(asc(products.name)),
      this.database.select({ id: vendors.id, name: vendors.name, active: vendors.active }).from(vendors).orderBy(asc(vendors.name)),
      this.database.select({ id: expenseCategories.id, name: expenseCategories.name, active: expenseCategories.active }).from(expenseCategories).orderBy(asc(expenseCategories.name)),
    ]);
    return { products: productRows, vendors: vendorRows, expenseCategories: categoryRows };
  }

  async createVisit(input: Parameters<BusinessRepository["createVisit"]>[0]) {
    return this.database.transaction(async (transaction) => {
      const totals = input.lines.reduce(
        (value, line) => ({
          gross: value.gross + line.finalPriceMinor,
          salon: value.salon + line.finalSalonMinor,
          professional: value.professional + line.finalProfessionalMinor,
        }),
        { gross: 0, salon: 0, professional: 0 },
      );
      const [created] = await transaction
        .insert(visits)
        .values({
          occurredAt: input.occurredAt,
          customerName: input.customerName || null,
          customerKind: input.customerKind,
          source: input.source || null,
          paymentMethod: input.paymentMethod,
          paymentReceiver: input.paymentReceiver,
          receivedByStaffId: input.receivedByStaffId || null,
          notes: input.notes || null,
          grossTotalMinor: totals.gross,
          salonTotalMinor: totals.salon,
          professionalTotalMinor: totals.professional,
          createdByUserId: input.createdByUserId,
        })
        .returning({ id: visits.id });
      await transaction.insert(visitServices).values(input.lines.map((line) => ({ ...line, visitId: created.id })));
      return created.id;
    });
  }

  async createExpense(input: Parameters<BusinessRepository["createExpense"]>[0]) {
    const [created] = await this.database
      .insert(expenses)
      .values({
        ...input,
        vendorId: input.vendorId || null,
        productId: input.productId || null,
        quantity: input.quantity ?? null,
        unit: input.unit || null,
        unitCostMinor: input.unitCostMinor ?? null,
        receiptReference: input.receiptReference || null,
        notes: input.notes || null,
      })
      .returning({ id: expenses.id });
    return created.id;
  }

  async createLostOpportunity(input: Parameters<BusinessRepository["createLostOpportunity"]>[0]) {
    const [created] = await this.database
      .insert(lostOpportunities)
      .values({ ...input, requestedAt: input.requestedAt ?? null, requestedServiceId: input.requestedServiceId || null, estimatedAmountMinor: input.estimatedAmountMinor ?? null, channel: input.channel || null, detail: input.detail || null, source: input.source || null })
      .returning({ id: lostOpportunities.id });
    return created.id;
  }

  async getDayPreview(businessDate: string, timezone: string) {
    const [row] = (await this.database.execute(sql`
      select
        coalesce(sum(v.gross_total_minor),0)::bigint gross,
        coalesce(sum(v.salon_total_minor),0)::bigint salon,
        coalesce(sum(v.gross_total_minor) filter (where v.payment_method='cash'),0)::bigint cash,
        coalesce(sum(v.gross_total_minor) filter (where v.payment_method='transfer'),0)::bigint transfer,
        coalesce(sum(v.gross_total_minor) filter (where v.payment_method='card'),0)::bigint card,
        count(v.id)::int visits,
        coalesce((select sum(e.amount_minor) from expense e where e.occurred_at >= (${businessDate}::date at time zone ${timezone}) and e.occurred_at < ((${businessDate}::date + interval '1 day') at time zone ${timezone})),0)::bigint expenses,
        (select count(*) from expense e where e.occurred_at >= (${businessDate}::date at time zone ${timezone}) and e.occurred_at < ((${businessDate}::date + interval '1 day') at time zone ${timezone}))::int expense_count,
        coalesce((select status::text from daily_closure where business_date=${businessDate} limit 1),'pending') status
      from visit v
      where v.occurred_at >= (${businessDate}::date at time zone ${timezone}) and v.occurred_at < ((${businessDate}::date + interval '1 day') at time zone ${timezone})
    `)) as unknown as NumericRow[];
    return { businessDate, grossMinor: asNumber(row.gross), salonMinor: asNumber(row.salon), cashMinor: asNumber(row.cash), transferMinor: asNumber(row.transfer), cardMinor: asNumber(row.card), expensesMinor: asNumber(row.expenses), visitCount: asNumber(row.visits), expenseCount: asNumber(row.expense_count), existingStatus: String(row.status) as "balanced" | "difference" | "incomplete" | "pending" };
  }

  async closeDay(input: Parameters<BusinessRepository["closeDay"]>[0]) {
    const [summary] = (await this.database.execute(sql`
      select
        coalesce((select sum(gross_total_minor) from visit where occurred_at >= (${input.businessDate}::date at time zone ${input.timezone}) and occurred_at < ((${input.businessDate}::date + interval '1 day') at time zone ${input.timezone})), 0)::bigint as total_income,
        coalesce((select sum(gross_total_minor) from visit where payment_method = 'cash' and occurred_at >= (${input.businessDate}::date at time zone ${input.timezone}) and occurred_at < ((${input.businessDate}::date + interval '1 day') at time zone ${input.timezone})), 0)::bigint as expected_cash,
        coalesce((select sum(amount_minor) from expense where occurred_at >= (${input.businessDate}::date at time zone ${input.timezone}) and occurred_at < ((${input.businessDate}::date + interval '1 day') at time zone ${input.timezone})), 0)::bigint as total_expense,
        (select count(*) from visit where occurred_at >= (${input.businessDate}::date at time zone ${input.timezone}) and occurred_at < ((${input.businessDate}::date + interval '1 day') at time zone ${input.timezone}))::int as visit_count,
        (select count(*) from expense where occurred_at >= (${input.businessDate}::date at time zone ${input.timezone}) and occurred_at < ((${input.businessDate}::date + interval '1 day') at time zone ${input.timezone}))::int as expense_count
    `)) as unknown as NumericRow[];
    const expectedCash = asNumber(summary.expected_cash);
    const difference = input.physicalCashMinor - expectedCash;
    const warnings: string[] = [];
    if (asNumber(summary.visit_count) === 0) warnings.push("No hay servicios registrados para este día.");
    if (asNumber(summary.expense_count) === 0) warnings.push("No hay gastos registrados para este día; confirma que no falte ninguno.");
    if (input.hasMissingSales) warnings.push("Indicaste que faltan ventas. Regístralas antes de considerar conciliado el día.");
    if (input.hasMissingExpenses) warnings.push("Indicaste que faltan gastos. Regístralos antes de considerar conciliado el día.");
    const status: "balanced" | "difference" | "incomplete" = warnings.length
      ? "incomplete"
      : difference === 0
        ? "balanced"
        : "difference";
    await this.database
      .insert(dailyClosures)
      .values({
        businessDate: input.businessDate,
        expectedCashMinor: expectedCash,
        physicalCashMinor: input.physicalCashMinor,
        differenceMinor: difference,
        totalIncomeMinor: asNumber(summary.total_income),
        totalExpenseMinor: asNumber(summary.total_expense),
        visitCount: asNumber(summary.visit_count),
        expenseCount: asNumber(summary.expense_count),
        hasMissingSales: input.hasMissingSales,
        hasMissingExpenses: input.hasMissingExpenses,
        status,
        warnings,
        notes: input.notes || null,
        closedByUserId: input.closedByUserId,
      })
      .onConflictDoUpdate({
        target: dailyClosures.businessDate,
        set: {
          expectedCashMinor: expectedCash,
          physicalCashMinor: input.physicalCashMinor,
          differenceMinor: difference,
          totalIncomeMinor: asNumber(summary.total_income),
          totalExpenseMinor: asNumber(summary.total_expense),
          visitCount: asNumber(summary.visit_count),
          expenseCount: asNumber(summary.expense_count),
          hasMissingSales: input.hasMissingSales,
          hasMissingExpenses: input.hasMissingExpenses,
          status,
          warnings,
          notes: input.notes || null,
          closedByUserId: input.closedByUserId,
          updatedAt: new Date(),
        },
      });
    return { status, differenceMinor: difference, warnings };
  }

  private visitFilter(filters: InsightsFilters, timezone: string, previous = false) {
    const start = previous ? filters.previousStartDate : filters.startDate;
    const end = previous ? filters.previousEndDate : filters.endDate;
    const conditions = [
      sql`v.occurred_at >= (${start}::date at time zone ${timezone})`,
      sql`v.occurred_at < ((${end}::date + interval '1 day') at time zone ${timezone})`,
    ];
    if (filters.paymentMethod) conditions.push(sql`v.payment_method = ${filters.paymentMethod}`);
    if (filters.paymentReceiver) conditions.push(sql`v.payment_receiver = ${filters.paymentReceiver}`);
    if (filters.source) conditions.push(sql`coalesce(v.source, 'unknown') = ${filters.source}`);
    if (filters.customerKind) conditions.push(sql`v.customer_kind = ${filters.customerKind}`);
    return sql.join(conditions, sql` and `);
  }

  private visitLineFilter(filters: InsightsFilters, timezone: string, previous = false) {
    const conditions = [this.visitFilter(filters, timezone, previous)];
    if (filters.professionalId) conditions.push(sql`vs.professional_id = ${filters.professionalId}`);
    if (filters.serviceId) conditions.push(sql`vs.service_id = ${filters.serviceId}`);
    if (filters.serviceCategory) conditions.push(sql`coalesce(vs.category_snapshot, '') = ${filters.serviceCategory}`);
    if (filters.priceAdjustmentReason) conditions.push(sql`vs.price_adjustment_reason = ${filters.priceAdjustmentReason}`);
    if (filters.splitAdjustmentReason) conditions.push(sql`vs.split_adjustment_reason = ${filters.splitAdjustmentReason}`);
    return sql.join(conditions, sql` and `);
  }

  private expenseFilter(filters: InsightsFilters, timezone: string, previous = false) {
    const start = previous ? filters.previousStartDate : filters.startDate;
    const end = previous ? filters.previousEndDate : filters.endDate;
    const conditions = [
      sql`e.occurred_at >= (${start}::date at time zone ${timezone})`,
      sql`e.occurred_at < ((${end}::date + interval '1 day') at time zone ${timezone})`,
    ];
    if (filters.paymentMethod) conditions.push(sql`e.payment_method = ${filters.paymentMethod}`);
    if (filters.expenseCategoryId) conditions.push(sql`e.category_id = ${filters.expenseCategoryId}`);
    if (filters.productId) conditions.push(sql`e.product_id = ${filters.productId}`);
    if (filters.vendorId) conditions.push(sql`e.vendor_id = ${filters.vendorId}`);
    return sql.join(conditions, sql` and `);
  }

  private lostFilter(filters: InsightsFilters, timezone: string, previous = false) {
    const start = previous ? filters.previousStartDate : filters.startDate;
    const end = previous ? filters.previousEndDate : filters.endDate;
    const conditions = [
      sql`l.occurred_at >= (${start}::date at time zone ${timezone})`,
      sql`l.occurred_at < ((${end}::date + interval '1 day') at time zone ${timezone})`,
    ];
    if (filters.serviceId) conditions.push(sql`l.requested_service_id = ${filters.serviceId}`);
    if (filters.source) conditions.push(sql`coalesce(l.source, 'unknown') = ${filters.source}`);
    if (filters.customerKind) conditions.push(sql`l.customer_kind = ${filters.customerKind}`);
    if (filters.lostReason) conditions.push(sql`l.reason = ${filters.lostReason}`);
    return sql.join(conditions, sql` and `);
  }

  async getInsightDetails(filters: InsightsFilters, timezone: string, kind: InsightDetailKind, cursor: { occurredAt: string; id: string } | undefined, limit: number): Promise<InsightDetailItem[]> {
    const visitCursor = cursor ? sql`and (v.occurred_at < ${cursor.occurredAt}::timestamptz or (v.occurred_at = ${cursor.occurredAt}::timestamptz and v.id < ${cursor.id}::uuid))` : sql``;
    const expenseCursor = cursor ? sql`and (e.occurred_at < ${cursor.occurredAt}::timestamptz or (e.occurred_at = ${cursor.occurredAt}::timestamptz and e.id < ${cursor.id}::uuid))` : sql``;
    const lostCursor = cursor ? sql`and (l.occurred_at < ${cursor.occurredAt}::timestamptz or (l.occurred_at = ${cursor.occurredAt}::timestamptz and l.id < ${cursor.id}::uuid))` : sql``;
    let rows;
    if (kind === "visits") rows = await this.database.execute(sql`select v.id::text, v.occurred_at::text occurred_at, string_agg(distinct vs.service_name_snapshot, ', ' order by vs.service_name_snapshot) concept, sum(vs.final_price_minor)::bigint amount, concat(v.payment_method, ' · ', v.payment_receiver) dimension from visit_service vs join visit v on v.id=vs.visit_id where ${this.visitLineFilter(filters, timezone)} ${visitCursor} group by v.id order by v.occurred_at desc, v.id desc limit ${limit}`);
    else if (kind === "expenses") rows = await this.database.execute(sql`select e.id::text, e.occurred_at::text occurred_at, e.description concept, e.amount_minor::bigint amount, concat(e.kind, ' · ', e.payment_method) dimension from expense e where ${this.expenseFilter(filters, timezone)} ${expenseCursor} order by e.occurred_at desc, e.id desc limit ${limit}`);
    else rows = await this.database.execute(sql`select l.id::text, l.occurred_at::text occurred_at, l.requested_service_snapshot concept, coalesce(l.estimated_amount_minor, 0)::bigint amount, concat(l.reason, ' · ', coalesce(l.channel, 'unknown')) dimension from lost_opportunity l where ${this.lostFilter(filters, timezone)} ${lostCursor} order by l.occurred_at desc, l.id desc limit ${limit}`);
    return (rows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), occurredAt: String(row.occurred_at), concept: String(row.concept), amountMinor: asNumber(row.amount), dimension: String(row.dimension) }));
  }

  async getInsights(filters: InsightsFilters, timezone: string): Promise<InsightsResult> {
    const currentLineFilter = this.visitLineFilter(filters, timezone);
    const previousLineFilter = this.visitLineFilter(filters, timezone, true);
    const currentExpenseFilter = this.expenseFilter(filters, timezone);
    const previousExpenseFilter = this.expenseFilter(filters, timezone, true);
    const currentLostFilter = this.lostFilter(filters, timezone);
    const previousLostFilter = this.lostFilter(filters, timezone, true);
    const results = await Promise.allSettled([
      this.database.execute(sql`
        select
          coalesce((select sum(vs.final_price_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter}), 0)::bigint gross,
          coalesce((select sum(vs.final_salon_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter}), 0)::bigint salon,
          coalesce((select sum(vs.final_professional_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter}), 0)::bigint professional,
          coalesce((select sum(e.amount_minor) from expense e where ${currentExpenseFilter}), 0)::bigint expense,
          (select count(distinct v.id) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter})::int visits,
          (select count(*) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter})::int services,
          coalesce((select sum(vs.final_price_minor) / nullif(count(distinct v.id), 0) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter}), 0)::bigint average_ticket,
          coalesce((select avg(case when vs.started_at is not null and vs.completed_at is not null then extract(epoch from (vs.completed_at-vs.started_at))/60 else nullif(vs.duration_minutes_snapshot, 0) end) from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter}), 0)::numeric average_duration,
          (select count(*) from lost_opportunity l where ${currentLostFilter})::int lost,
          coalesce((select sum(l.estimated_amount_minor) from lost_opportunity l where ${currentLostFilter}), 0)::bigint estimated_lost
      `),
      this.database.execute(sql`
        select
          coalesce((select sum(vs.final_price_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter}), 0)::bigint gross,
          coalesce((select sum(vs.final_salon_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter}), 0)::bigint salon,
          coalesce((select sum(vs.final_professional_minor) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter}), 0)::bigint professional,
          coalesce((select sum(e.amount_minor) from expense e where ${previousExpenseFilter}), 0)::bigint expense,
          (select count(distinct v.id) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter})::int visits,
          (select count(*) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter})::int services,
          coalesce((select sum(vs.final_price_minor) / nullif(count(distinct v.id), 0) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter}), 0)::bigint average_ticket,
          coalesce((select avg(case when vs.started_at is not null and vs.completed_at is not null then extract(epoch from (vs.completed_at-vs.started_at))/60 else nullif(vs.duration_minutes_snapshot, 0) end) from visit_service vs join visit v on v.id=vs.visit_id where ${previousLineFilter}), 0)::numeric average_duration,
          (select count(*) from lost_opportunity l where ${previousLostFilter})::int lost,
          coalesce((select sum(l.estimated_amount_minor) from lost_opportunity l where ${previousLostFilter}), 0)::bigint estimated_lost
      `),
      this.database.execute(sql`
        with dates as (select generate_series(${filters.startDate}::date, ${filters.endDate}::date, interval '1 day')::date as business_date),
        income as (select (v.occurred_at at time zone ${timezone})::date as business_date, sum(vs.final_price_minor)::bigint amount, count(distinct v.id)::int visits from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by 1),
        outflow as (select (e.occurred_at at time zone ${timezone})::date as business_date, sum(e.amount_minor)::bigint amount from expense e where ${currentExpenseFilter} group by 1)
        select to_char(d.business_date, 'YYYY-MM-DD') label, coalesce(i.amount, 0)::bigint income, coalesce(o.amount, 0)::bigint expense, coalesce(i.visits, 0)::int visits from dates d left join income i on i.business_date=d.business_date left join outflow o on o.business_date=d.business_date order by d.business_date
      `),
      this.database.execute(sql`select v.payment_method label, sum(vs.final_price_minor)::bigint value from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.payment_method order by value desc`),
      this.database.execute(sql`select v.payment_method method, v.payment_receiver receiver, sum(vs.final_price_minor)::bigint value from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.payment_method, v.payment_receiver order by value desc`),
      this.database.execute(sql`select coalesce(vs.professional_id::text, 'none') id, coalesce(max(vs.professional_name_snapshot), 'Sin colaboradora') label, sum(vs.final_price_minor)::bigint value, sum(vs.final_salon_minor)::bigint salon, sum(vs.final_professional_minor)::bigint professional, count(distinct vs.visit_id)::int visits from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by vs.professional_id order by value desc limit 20`),
      this.database.execute(sql`select coalesce(vs.service_id::text, 'pending') id, max(vs.service_name_snapshot) label, sum(vs.final_price_minor)::bigint value, sum(vs.final_salon_minor)::bigint salon, sum(vs.final_professional_minor)::bigint professional, count(distinct vs.visit_id)::int visits, coalesce(avg(case when vs.started_at is not null and vs.completed_at is not null then extract(epoch from (vs.completed_at-vs.started_at))/60 else nullif(vs.duration_minutes_snapshot, 0) end),0)::numeric average_duration from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by vs.service_id, vs.service_name_snapshot order by value desc limit 20`),
      this.database.execute(sql`select coalesce(e.category_id::text, 'none') id, coalesce(max(c.name), 'Sin categoría') label, sum(e.amount_minor)::bigint value from expense e left join expense_category c on c.id=e.category_id where ${currentExpenseFilter} group by e.category_id order by value desc limit 20`),
      this.database.execute(sql`select e.kind label, sum(e.amount_minor)::bigint value from expense e where ${currentExpenseFilter} group by e.kind order by value desc`),
      this.database.execute(sql`select coalesce(e.vendor_id::text, 'none') id, coalesce(max(vd.name), 'Sin proveedor') label, sum(e.amount_minor)::bigint value from expense e left join vendor vd on vd.id=e.vendor_id where ${currentExpenseFilter} group by e.vendor_id order by value desc limit 20`),
      this.database.execute(sql`select coalesce(e.product_id::text, 'none') id, coalesce(max(p.name), 'Sin producto') label, sum(e.amount_minor)::bigint value from expense e left join product p on p.id=e.product_id where ${currentExpenseFilter} group by e.product_id order by value desc limit 20`),
      this.database.execute(sql`select v.payment_receiver label, sum(vs.final_price_minor)::bigint value from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.payment_receiver order by value desc`),
      this.database.execute(sql`select coalesce(v.source, 'unknown') label, sum(vs.final_price_minor)::bigint value, count(distinct v.id)::int visits from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.source order by value desc`),
      this.database.execute(sql`select v.customer_kind label, count(distinct v.id)::int visits from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.customer_kind order by visits desc`),
      this.database.execute(sql`select l.reason label, count(*)::int opportunities, coalesce(sum(l.estimated_amount_minor),0)::bigint estimated from lost_opportunity l where ${currentLostFilter} group by l.reason order by opportunities desc`),
      this.database.execute(sql`select coalesce(l.requested_service_id::text, 'adhoc') id, max(l.requested_service_snapshot) label, count(*)::int opportunities, coalesce(sum(l.estimated_amount_minor),0)::bigint estimated from lost_opportunity l where ${currentLostFilter} group by l.requested_service_id, l.requested_service_snapshot order by opportunities desc limit 20`),
      this.database.execute(sql`select coalesce(l.channel, 'unknown') label, count(*)::int opportunities from lost_opportunity l where ${currentLostFilter} group by l.channel order by opportunities desc`),
      this.database.execute(sql`select l.customer_kind label, count(*)::int opportunities from lost_opportunity l where ${currentLostFilter} group by l.customer_kind order by opportunities desc`),
      this.database.execute(sql`select extract(isodow from (coalesce(vs.started_at, v.occurred_at) at time zone ${timezone}))::int weekday, extract(hour from (coalesce(vs.started_at, v.occurred_at) at time zone ${timezone}))::int business_hour, count(*)::int services, sum(vs.final_price_minor)::bigint value from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by 1,2 order by 1,2`),
      this.database.execute(sql`
        select 'price' type, coalesce(vs.price_adjustment_reason, 'Sin ajuste') label, count(*)::int count, sum(vs.list_price_minor_snapshot-vs.final_price_minor)::bigint difference from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} and vs.final_price_minor<>vs.suggested_price_minor group by vs.price_adjustment_reason
        union all
        select 'split' type, coalesce(vs.split_adjustment_reason, 'Sin ajuste') label, count(*)::int count, sum(abs(vs.final_salon_minor-vs.suggested_salon_minor))::bigint difference from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} and (vs.final_salon_minor<>vs.suggested_salon_minor or vs.final_professional_minor<>vs.suggested_professional_minor) group by vs.split_adjustment_reason
      `),
      this.database.execute(sql`select status label, count(*)::int days, coalesce(sum(abs(difference_minor)),0)::bigint difference from daily_closure where business_date::date between ${filters.startDate}::date and ${filters.endDate}::date group by status order by status`),
      this.database.execute(sql`select v.id::text, v.occurred_at::text occurred_at, v.customer_name, sum(vs.final_price_minor)::bigint total, v.payment_method from visit_service vs join visit v on v.id=vs.visit_id where ${currentLineFilter} group by v.id order by v.occurred_at desc, v.id desc limit 50`),
      this.database.execute(sql`select e.id::text, e.occurred_at::text occurred_at, e.description, e.amount_minor::bigint amount, e.payment_method from expense e where ${currentExpenseFilter} order by e.occurred_at desc, e.id desc limit 50`),
      this.database.execute(sql`select l.id::text, l.occurred_at::text occurred_at, l.requested_service_snapshot service, l.reason, coalesce(l.estimated_amount_minor,0)::bigint estimated from lost_opportunity l where ${currentLostFilter} order by l.occurred_at desc, l.id desc limit 50`),
    ]);

    const required = (index: number) => {
      const result = results[index];
      if (result.status === "rejected") throw result.reason;
      return result.value;
    };
    const optional = (index: number, block: string) => {
      const result = results[index];
      if (result.status === "fulfilled") return result.value;
      console.error("Bloque de Insights no disponible", { block, technicalMessage: result.reason instanceof Error ? result.reason.message : String(result.reason) });
      return [];
    };
    const [currentRows, previousRows, dailyRows, paymentRows, paymentFlowRows, professionalRows, serviceRows, categoryRows, expenseKindRows, vendorRows, productRows, receiverRows, sourceRows, customerRows, lostReasonRows, lostServiceRows, lostChannelRows, lostCustomerRows, activityRows, adjustmentRows, closureRows, recentRows, recentExpenseRows, recentLostRows] = [
      required(0), required(1), optional(2, "serie temporal"), optional(3, "métodos de pago"), optional(4, "flujo de pagos"), optional(5, "colaboradoras"), optional(6, "servicios"), optional(7, "categorías de gasto"), optional(8, "tipos de egreso"), optional(9, "proveedores"), optional(10, "productos"), optional(11, "receptores"), optional(12, "origen"), optional(13, "clientela"), optional(14, "motivos perdidos"), optional(15, "servicios perdidos"), optional(16, "canales perdidos"), optional(17, "clientela perdida"), optional(18, "actividad horaria"), optional(19, "ajustes"), optional(20, "cierres"), optional(21, "detalle de visitas"), optional(22, "detalle de egresos"), optional(23, "detalle de oportunidades"),
    ];

    const current = (currentRows as unknown as NumericRow[])[0];
    const previous = (previousRows as unknown as NumericRow[])[0];
    const currentPreliminary = asNumber(current.salon) - asNumber(current.expense);
    const previousPreliminary = asNumber(previous.salon) - asNumber(previous.expense);
    return {
      range: { startDate: filters.startDate, endDate: filters.endDate },
      metrics: {
        grossIncome: comparison(asNumber(current.gross), asNumber(previous.gross)),
        salonIncome: comparison(asNumber(current.salon), asNumber(previous.salon)),
        professionalPayments: comparison(asNumber(current.professional), asNumber(previous.professional)),
        expenses: comparison(asNumber(current.expense), asNumber(previous.expense)),
        preliminaryResult: comparison(currentPreliminary, previousPreliminary),
        visits: comparison(asNumber(current.visits), asNumber(previous.visits)),
        services: comparison(asNumber(current.services), asNumber(previous.services)),
        averageTicket: comparison(asNumber(current.average_ticket), asNumber(previous.average_ticket)),
        averageDurationMinutes: comparison(asNumber(current.average_duration), asNumber(previous.average_duration)),
        lostOpportunities: comparison(asNumber(current.lost), asNumber(previous.lost)),
        estimatedLost: comparison(asNumber(current.estimated_lost), asNumber(previous.estimated_lost)),
      },
      daily: (dailyRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), incomeMinor: asNumber(row.income), expenseMinor: asNumber(row.expense), visits: asNumber(row.visits) })),
      byPaymentMethod: (paymentRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), valueMinor: asNumber(row.value) })),
      byPaymentFlow: (paymentFlowRows as unknown as NumericRow[]).map((row) => ({ method: String(row.method), receiver: String(row.receiver), valueMinor: asNumber(row.value) })),
      byProfessional: (professionalRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), valueMinor: asNumber(row.value), salonMinor: asNumber(row.salon), professionalMinor: asNumber(row.professional), visits: asNumber(row.visits) })),
      byService: (serviceRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), valueMinor: asNumber(row.value), salonMinor: asNumber(row.salon), professionalMinor: asNumber(row.professional), visits: asNumber(row.visits), averageDurationMinutes: asNumber(row.average_duration) })),
      byExpenseCategory: (categoryRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), valueMinor: asNumber(row.value) })),
      byExpenseKind: (expenseKindRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), valueMinor: asNumber(row.value) })),
      byVendor: (vendorRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), valueMinor: asNumber(row.value) })),
      byProduct: (productRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), valueMinor: asNumber(row.value) })),
      byReceiver: (receiverRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), valueMinor: asNumber(row.value) })),
      bySource: (sourceRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), valueMinor: asNumber(row.value), visits: asNumber(row.visits) })),
      byCustomerKind: (customerRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), visits: asNumber(row.visits) })),
      byLostReason: (lostReasonRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), opportunities: asNumber(row.opportunities), estimatedMinor: asNumber(row.estimated) })),
      byLostService: (lostServiceRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), label: String(row.label), opportunities: asNumber(row.opportunities), estimatedMinor: asNumber(row.estimated) })),
      byLostChannel: (lostChannelRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), opportunities: asNumber(row.opportunities) })),
      lostByCustomerKind: (lostCustomerRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), opportunities: asNumber(row.opportunities) })),
      activityByWeekdayHour: (activityRows as unknown as NumericRow[]).map((row) => ({ weekday: asNumber(row.weekday), hour: asNumber(row.business_hour), services: asNumber(row.services), valueMinor: asNumber(row.value) })),
      adjustments: (adjustmentRows as unknown as NumericRow[]).map((row) => ({ type: String(row.type) as "price" | "split", label: String(row.label), count: asNumber(row.count), differenceMinor: asNumber(row.difference) })),
      closureQuality: (closureRows as unknown as NumericRow[]).map((row) => ({ label: String(row.label), days: asNumber(row.days), differenceMinor: asNumber(row.difference) })),
      recentVisits: (recentRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), occurredAt: String(row.occurred_at), customerName: row.customer_name ? String(row.customer_name) : null, totalMinor: asNumber(row.total), paymentMethod: String(row.payment_method) })),
      recentExpenses: (recentExpenseRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), occurredAt: String(row.occurred_at), description: String(row.description), amountMinor: asNumber(row.amount), paymentMethod: String(row.payment_method) })),
      recentLostOpportunities: (recentLostRows as unknown as NumericRow[]).map((row) => ({ id: String(row.id), occurredAt: String(row.occurred_at), service: String(row.service), reason: String(row.reason), estimatedMinor: asNumber(row.estimated) })),
    };
  }
}
