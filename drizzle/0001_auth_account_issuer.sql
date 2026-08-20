DROP INDEX "auth_account_provider_uq";--> statement-breakpoint
ALTER TABLE "auth_account" ADD COLUMN "issuer" text DEFAULT 'local:credential' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_account_issuer_uq" ON "auth_account" USING btree ("issuer","account_id");