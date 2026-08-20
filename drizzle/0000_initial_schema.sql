CREATE TYPE "public"."agreement_kind" AS ENUM('percentage', 'employee', 'owner', 'manual');--> statement-breakpoint
CREATE TYPE "public"."closure_status" AS ENUM('balanced', 'difference', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."customer_kind" AS ENUM('new', 'returning', 'unspecified');--> statement-breakpoint
CREATE TYPE "public"."opportunity_reason" AS ENUM('no_availability', 'service_unavailable', 'price', 'schedule', 'no_response', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."resource_owner" AS ENUM('salon', 'professional', 'shared');--> statement-breakpoint
CREATE TYPE "public"."staff_kind" AS ENUM('owner', 'employee', 'professional', 'other');--> statement-breakpoint
CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_closure" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_date" text NOT NULL,
	"expected_cash_minor" integer NOT NULL,
	"physical_cash_minor" integer NOT NULL,
	"difference_minor" integer NOT NULL,
	"total_income_minor" integer NOT NULL,
	"total_expense_minor" integer NOT NULL,
	"visit_count" integer NOT NULL,
	"expense_count" integer NOT NULL,
	"status" "closure_status" NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"closed_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"description" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"category_id" uuid,
	"vendor_id" uuid,
	"product_id" uuid,
	"quantity" integer,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expense_amount_ck" CHECK ("expense"."amount_minor" > 0),
	CONSTRAINT "expense_quantity_ck" CHECK ("expense"."quantity" is null or "expense"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "lost_opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"requested_service_id" uuid,
	"requested_service_snapshot" text NOT NULL,
	"estimated_amount_minor" integer,
	"reason" "opportunity_reason" NOT NULL,
	"detail" text,
	"source" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lost_opportunity_estimate_ck" CHECK ("lost_opportunity"."estimated_amount_minor" is null or "lost_opportunity"."estimated_amount_minor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category" text NOT NULL,
	"list_price_minor" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_list_price_ck" CHECK ("service"."list_price_minor" >= 0),
	CONSTRAINT "service_duration_ck" CHECK ("service"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "staff_kind" DEFAULT 'professional' NOT NULL,
	"phone" text,
	"notes" text,
	"materials_owner" "resource_owner" DEFAULT 'professional' NOT NULL,
	"tools_owner" "resource_owner" DEFAULT 'professional' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_agreement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"kind" "agreement_kind" NOT NULL,
	"salon_share_bps" integer NOT NULL,
	"professional_share_bps" integer NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_agreement_salon_share_ck" CHECK ("staff_agreement"."salon_share_bps" between 0 and 10000),
	CONSTRAINT "staff_agreement_professional_share_ck" CHECK ("staff_agreement"."professional_share_bps" between 0 and 10000),
	CONSTRAINT "staff_agreement_total_share_ck" CHECK ("staff_agreement"."salon_share_bps" + "staff_agreement"."professional_share_bps" = 10000)
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visit_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"service_id" uuid,
	"professional_id" uuid,
	"service_name_snapshot" text NOT NULL,
	"category_snapshot" text,
	"professional_name_snapshot" text,
	"list_price_minor_snapshot" integer NOT NULL,
	"suggested_price_minor" integer NOT NULL,
	"final_price_minor" integer NOT NULL,
	"price_adjustment_reason" text,
	"agreement_kind_snapshot" text,
	"salon_share_bps_snapshot" integer,
	"professional_share_bps_snapshot" integer,
	"suggested_salon_minor" integer NOT NULL,
	"suggested_professional_minor" integer NOT NULL,
	"final_salon_minor" integer NOT NULL,
	"final_professional_minor" integer NOT NULL,
	"split_adjustment_reason" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"pending_catalog_completion" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visit_service_price_ck" CHECK ("visit_service"."final_price_minor" >= 0),
	CONSTRAINT "visit_service_split_ck" CHECK ("visit_service"."final_price_minor" = "visit_service"."final_salon_minor" + "visit_service"."final_professional_minor"),
	CONSTRAINT "visit_service_price_reason_ck" CHECK ("visit_service"."final_price_minor" = "visit_service"."suggested_price_minor" or nullif(trim("visit_service"."price_adjustment_reason"), '') is not null),
	CONSTRAINT "visit_service_split_reason_ck" CHECK (("visit_service"."final_salon_minor" = "visit_service"."suggested_salon_minor" and "visit_service"."final_professional_minor" = "visit_service"."suggested_professional_minor") or nullif(trim("visit_service"."split_adjustment_reason"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "visit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"customer_name" text,
	"customer_kind" "customer_kind" DEFAULT 'unspecified' NOT NULL,
	"source" text,
	"payment_method" "payment_method" NOT NULL,
	"received_by_staff_id" uuid,
	"notes" text,
	"gross_total_minor" integer NOT NULL,
	"salon_total_minor" integer NOT NULL,
	"professional_total_minor" integer NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visit_gross_total_ck" CHECK ("visit"."gross_total_minor" >= 0),
	CONSTRAINT "visit_split_total_ck" CHECK ("visit"."gross_total_minor" = "visit"."salon_total_minor" + "visit"."professional_total_minor")
);
--> statement-breakpoint
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_closure" ADD CONSTRAINT "daily_closure_closed_by_user_id_auth_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_expense_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_vendor_id_vendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_created_by_user_id_auth_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_opportunity" ADD CONSTRAINT "lost_opportunity_requested_service_id_service_id_fk" FOREIGN KEY ("requested_service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_opportunity" ADD CONSTRAINT "lost_opportunity_created_by_user_id_auth_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_agreement" ADD CONSTRAINT "staff_agreement_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_service" ADD CONSTRAINT "visit_service_visit_id_visit_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_service" ADD CONSTRAINT "visit_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_service" ADD CONSTRAINT "visit_service_professional_id_staff_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_received_by_staff_id_staff_id_fk" FOREIGN KEY ("received_by_staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit" ADD CONSTRAINT "visit_created_by_user_id_auth_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_account_provider_uq" ON "auth_account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "auth_account_user_idx" ON "auth_account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_closure_business_date_uq" ON "daily_closure" USING btree ("business_date");--> statement-breakpoint
CREATE UNIQUE INDEX "expense_category_normalized_name_uq" ON "expense_category" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "expense_occurred_at_idx" ON "expense" USING btree ("occurred_at","id");--> statement-breakpoint
CREATE INDEX "expense_category_idx" ON "expense" USING btree ("category_id","occurred_at");--> statement-breakpoint
CREATE INDEX "lost_opportunity_occurred_at_idx" ON "lost_opportunity" USING btree ("occurred_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_normalized_name_uq" ON "product" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "service_normalized_name_uq" ON "service" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "service_cursor_idx" ON "service" USING btree ("active","normalized_name","id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_session_token_uq" ON "auth_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "auth_session_user_idx" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_session_expiry_idx" ON "auth_session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "staff_active_name_idx" ON "staff" USING btree ("active","name","id");--> statement-breakpoint
CREATE INDEX "staff_agreement_current_idx" ON "staff_agreement" USING btree ("staff_id","effective_from","effective_to");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_user_email_uq" ON "auth_user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_normalized_name_uq" ON "vendor" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "visit_service_visit_idx" ON "visit_service" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "visit_service_professional_idx" ON "visit_service" USING btree ("professional_id","visit_id");--> statement-breakpoint
CREATE INDEX "visit_service_service_idx" ON "visit_service" USING btree ("service_id","visit_id");--> statement-breakpoint
CREATE INDEX "visit_occurred_at_idx" ON "visit" USING btree ("occurred_at","id");--> statement-breakpoint
CREATE INDEX "visit_payment_method_idx" ON "visit" USING btree ("payment_method","occurred_at");