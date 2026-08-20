import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const user = pgTable(
  "auth_user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    ...auditColumns,
  },
  (table) => [uniqueIndex("auth_user_email_uq").on(table.email)],
);

export const session = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("auth_session_token_uq").on(table.token),
    index("auth_session_user_idx").on(table.userId),
    index("auth_session_expiry_idx").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").default("local:credential").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex("auth_account_issuer_uq").on(table.issuer, table.accountId),
    index("auth_account_user_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...auditColumns,
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

export const staffKind = pgEnum("staff_kind", ["owner", "employee", "professional", "other"]);
export const resourceOwner = pgEnum("resource_owner", ["salon", "professional", "shared"]);
export const agreementKind = pgEnum("agreement_kind", ["percentage", "employee", "owner", "manual"]);
export const customerKind = pgEnum("customer_kind", ["new", "returning", "unspecified"]);
export const paymentMethod = pgEnum("payment_method", ["cash", "card", "transfer", "other"]);
export const paymentReceiver = pgEnum("payment_receiver", ["salon", "professional", "unknown"]);
export const expenseKind = pgEnum("expense_kind", ["purchase", "operational"]);
export const opportunityReason = pgEnum("opportunity_reason", [
  "no_availability",
  "service_unavailable",
  "price",
  "client_cancelled",
  "no_show",
  "schedule",
  "no_response",
  "other",
]);
export const closureStatus = pgEnum("closure_status", ["balanced", "difference", "incomplete"]);

export const staff = pgTable(
  "staff",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    kind: staffKind("kind").default("professional").notNull(),
    specialty: text("specialty"),
    phone: text("phone"),
    notes: text("notes"),
    materialsOwner: resourceOwner("materials_owner").default("professional").notNull(),
    toolsOwner: resourceOwner("tools_owner").default("professional").notNull(),
    active: boolean("active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [index("staff_active_name_idx").on(table.active, table.name, table.id)],
);

export const staffAgreements = pgTable(
  "staff_agreement",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    kind: agreementKind("kind").notNull(),
    salonShareBps: integer("salon_share_bps").notNull(),
    professionalShareBps: integer("professional_share_bps").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow().notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    notes: text("notes"),
    ...auditColumns,
  },
  (table) => [
    check("staff_agreement_salon_share_ck", sql`${table.salonShareBps} between 0 and 10000`),
    check(
      "staff_agreement_professional_share_ck",
      sql`${table.professionalShareBps} between 0 and 10000`,
    ),
    check(
      "staff_agreement_total_share_ck",
      sql`${table.salonShareBps} + ${table.professionalShareBps} = 10000`,
    ),
    index("staff_agreement_current_idx").on(table.staffId, table.effectiveFrom, table.effectiveTo),
  ],
);

export const services = pgTable(
  "service",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    category: text("category").notNull(),
    normalizedCategory: text("normalized_category").default("").notNull(),
    description: text("description"),
    listPriceMinor: integer("list_price_minor").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    active: boolean("active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [
    check("service_list_price_ck", sql`${table.listPriceMinor} >= 0`),
    check("service_duration_ck", sql`${table.durationMinutes} > 0`),
    uniqueIndex("service_normalized_name_uq").on(table.normalizedName),
    index("service_cursor_idx").on(table.active, table.normalizedName, table.id),
    index("service_category_idx").on(table.active, table.normalizedCategory, table.id),
  ],
);

export const products = pgTable(
  "product",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    active: boolean("active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [uniqueIndex("product_normalized_name_uq").on(table.normalizedName)],
);

export const vendors = pgTable(
  "vendor",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    active: boolean("active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [uniqueIndex("vendor_normalized_name_uq").on(table.normalizedName)],
);

export const expenseCategories = pgTable(
  "expense_category",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    active: boolean("active").default(true).notNull(),
    ...auditColumns,
  },
  (table) => [uniqueIndex("expense_category_normalized_name_uq").on(table.normalizedName)],
);

export const visits = pgTable(
  "visit",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    customerName: text("customer_name"),
    customerKind: customerKind("customer_kind").default("unspecified").notNull(),
    source: text("source"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentReceiver: paymentReceiver("payment_receiver").default("unknown").notNull(),
    receivedByStaffId: uuid("received_by_staff_id").references(() => staff.id, { onDelete: "set null" }),
    notes: text("notes"),
    grossTotalMinor: integer("gross_total_minor").notNull(),
    salonTotalMinor: integer("salon_total_minor").notNull(),
    professionalTotalMinor: integer("professional_total_minor").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns,
  },
  (table) => [
    check("visit_gross_total_ck", sql`${table.grossTotalMinor} >= 0`),
    check(
      "visit_split_total_ck",
      sql`${table.grossTotalMinor} = ${table.salonTotalMinor} + ${table.professionalTotalMinor}`,
    ),
    index("visit_occurred_at_idx").on(table.occurredAt, table.id),
    index("visit_payment_method_idx").on(table.paymentMethod, table.occurredAt),
  ],
);

export const visitServices = pgTable(
  "visit_service",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    visitId: uuid("visit_id")
      .notNull()
      .references(() => visits.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    professionalId: uuid("professional_id").references(() => staff.id, { onDelete: "set null" }),
    serviceNameSnapshot: text("service_name_snapshot").notNull(),
    categorySnapshot: text("category_snapshot"),
    professionalNameSnapshot: text("professional_name_snapshot"),
    listPriceMinorSnapshot: integer("list_price_minor_snapshot").notNull(),
    durationMinutesSnapshot: integer("duration_minutes_snapshot").default(0).notNull(),
    suggestedPriceMinor: integer("suggested_price_minor").notNull(),
    finalPriceMinor: integer("final_price_minor").notNull(),
    priceAdjustmentReason: text("price_adjustment_reason"),
    agreementKindSnapshot: text("agreement_kind_snapshot"),
    salonShareBpsSnapshot: integer("salon_share_bps_snapshot"),
    professionalShareBpsSnapshot: integer("professional_share_bps_snapshot"),
    suggestedSalonMinor: integer("suggested_salon_minor").notNull(),
    suggestedProfessionalMinor: integer("suggested_professional_minor").notNull(),
    finalSalonMinor: integer("final_salon_minor").notNull(),
    finalProfessionalMinor: integer("final_professional_minor").notNull(),
    splitAdjustmentReason: text("split_adjustment_reason"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    pendingCatalogCompletion: boolean("pending_catalog_completion").default(false).notNull(),
    ...auditColumns,
  },
  (table) => [
    check("visit_service_price_ck", sql`${table.finalPriceMinor} >= 0`),
    check(
      "visit_service_split_ck",
      sql`${table.finalPriceMinor} = ${table.finalSalonMinor} + ${table.finalProfessionalMinor}`,
    ),
    check(
      "visit_service_price_reason_ck",
      sql`${table.finalPriceMinor} = ${table.suggestedPriceMinor} or nullif(trim(${table.priceAdjustmentReason}), '') is not null`,
    ),
    check(
      "visit_service_split_reason_ck",
      sql`(${table.finalSalonMinor} = ${table.suggestedSalonMinor} and ${table.finalProfessionalMinor} = ${table.suggestedProfessionalMinor}) or nullif(trim(${table.splitAdjustmentReason}), '') is not null`,
    ),
    index("visit_service_visit_idx").on(table.visitId),
    index("visit_service_professional_idx").on(table.professionalId, table.visitId),
    index("visit_service_service_idx").on(table.serviceId, table.visitId),
  ],
);

export const expenses = pgTable(
  "expense",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    kind: expenseKind("kind").default("operational").notNull(),
    description: text("description").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    categoryId: uuid("category_id").notNull().references(() => expenseCategories.id, { onDelete: "restrict" }),
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    quantity: integer("quantity"),
    unit: text("unit"),
    unitCostMinor: integer("unit_cost_minor"),
    receiptReference: text("receipt_reference"),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns,
  },
  (table) => [
    check("expense_amount_ck", sql`${table.amountMinor} > 0`),
    check("expense_quantity_ck", sql`${table.quantity} is null or ${table.quantity} > 0`),
    check("expense_unit_cost_ck", sql`${table.unitCostMinor} is null or ${table.unitCostMinor} >= 0`),
    index("expense_occurred_at_idx").on(table.occurredAt, table.id),
    index("expense_category_idx").on(table.categoryId, table.occurredAt),
  ],
);

export const lostOpportunities = pgTable(
  "lost_opportunity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }),
    requestedServiceId: uuid("requested_service_id").references(() => services.id, { onDelete: "set null" }),
    requestedServiceSnapshot: text("requested_service_snapshot").notNull(),
    estimatedAmountMinor: integer("estimated_amount_minor"),
    reason: opportunityReason("reason").notNull(),
    channel: text("channel"),
    customerKind: customerKind("customer_kind").default("unspecified").notNull(),
    detail: text("detail"),
    source: text("source"),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns,
  },
  (table) => [
    check(
      "lost_opportunity_estimate_ck",
      sql`${table.estimatedAmountMinor} is null or ${table.estimatedAmountMinor} >= 0`,
    ),
    index("lost_opportunity_occurred_at_idx").on(table.occurredAt, table.id),
    index("lost_opportunity_requested_at_idx").on(table.requestedAt, table.id),
  ],
);

export const dailyClosures = pgTable(
  "daily_closure",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessDate: text("business_date").notNull(),
    expectedCashMinor: integer("expected_cash_minor").notNull(),
    physicalCashMinor: integer("physical_cash_minor").notNull(),
    differenceMinor: integer("difference_minor").notNull(),
    totalIncomeMinor: integer("total_income_minor").notNull(),
    totalExpenseMinor: integer("total_expense_minor").notNull(),
    visitCount: integer("visit_count").notNull(),
    expenseCount: integer("expense_count").notNull(),
    hasMissingSales: boolean("has_missing_sales").default(false).notNull(),
    hasMissingExpenses: boolean("has_missing_expenses").default(false).notNull(),
    status: closureStatus("status").notNull(),
    warnings: jsonb("warnings").$type<string[]>().default([]).notNull(),
    notes: text("notes"),
    closedByUserId: text("closed_by_user_id").references(() => user.id, { onDelete: "set null" }),
    ...auditColumns,
  },
  (table) => [uniqueIndex("daily_closure_business_date_uq").on(table.businessDate)],
);

export const authRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  agreements: many(staffAgreements),
}));

export const staffAgreementRelations = relations(staffAgreements, ({ one }) => ({
  staff: one(staff, { fields: [staffAgreements.staffId], references: [staff.id] }),
}));

export const visitRelations = relations(visits, ({ many }) => ({
  services: many(visitServices),
}));

export const visitServiceRelations = relations(visitServices, ({ one }) => ({
  visit: one(visits, { fields: [visitServices.visitId], references: [visits.id] }),
  service: one(services, { fields: [visitServices.serviceId], references: [services.id] }),
  professional: one(staff, {
    fields: [visitServices.professionalId],
    references: [staff.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  staff,
  staffAgreements,
  services,
  products,
  vendors,
  expenseCategories,
  visits,
  visitServices,
  expenses,
  lostOpportunities,
  dailyClosures,
  authRelations,
  sessionRelations,
  accountRelations,
  staffRelations,
  staffAgreementRelations,
  visitRelations,
  visitServiceRelations,
};

export type DatabaseSchema = typeof schema;
export type StaffRow = typeof staff.$inferSelect;
export type ServiceRow = typeof services.$inferSelect;
export type VisitRow = typeof visits.$inferSelect;
