CREATE TYPE "public"."expense_kind" AS ENUM('purchase', 'operational');--> statement-breakpoint
ALTER TYPE "public"."opportunity_reason" ADD VALUE 'client_cancelled' BEFORE 'schedule';--> statement-breakpoint
ALTER TYPE "public"."opportunity_reason" ADD VALUE 'no_show' BEFORE 'schedule';--> statement-breakpoint
ALTER TABLE "expense" DROP CONSTRAINT "expense_category_id_expense_category_id_fk";
--> statement-breakpoint
INSERT INTO "expense_category" ("id", "name", "normalized_name", "active")
VALUES ('00000000-0000-4000-8000-000000000005', 'Otro', 'otro', true)
ON CONFLICT ("normalized_name") DO NOTHING;--> statement-breakpoint
UPDATE "expense"
SET "category_id" = (SELECT "id" FROM "expense_category" WHERE "normalized_name" = 'otro' LIMIT 1)
WHERE "category_id" IS NULL;--> statement-breakpoint
ALTER TABLE "expense" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "kind" "expense_kind" DEFAULT 'operational' NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "unit" text;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "unit_cost_minor" integer;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "receipt_reference" text;--> statement-breakpoint
ALTER TABLE "lost_opportunity" ADD COLUMN "requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lost_opportunity" ADD COLUMN "channel" text;--> statement-breakpoint
ALTER TABLE "lost_opportunity" ADD COLUMN "customer_kind" "customer_kind" DEFAULT 'unspecified' NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_expense_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lost_opportunity_requested_at_idx" ON "lost_opportunity" USING btree ("requested_at","id");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_unit_cost_ck" CHECK ("expense"."unit_cost_minor" is null or "expense"."unit_cost_minor" >= 0);
