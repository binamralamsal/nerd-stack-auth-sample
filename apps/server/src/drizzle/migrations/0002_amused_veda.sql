DROP INDEX IF EXISTS "email_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree (lower("email"));