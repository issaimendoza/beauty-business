ALTER TABLE "service" ADD COLUMN "normalized_category" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "service" SET "normalized_category" = lower(trim(regexp_replace("category", '\\s+', ' ', 'g')));--> statement-breakpoint
CREATE INDEX "service_category_idx" ON "service" USING btree ("active","normalized_category","id");
