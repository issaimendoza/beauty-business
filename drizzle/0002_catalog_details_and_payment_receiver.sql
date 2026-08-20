CREATE TYPE "public"."payment_receiver" AS ENUM('salon', 'professional', 'unknown');--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "specialty" text;--> statement-breakpoint
ALTER TABLE "visit" ADD COLUMN "payment_receiver" "payment_receiver" DEFAULT 'unknown' NOT NULL;