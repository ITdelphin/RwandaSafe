-- Add email verification fields to User model
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_code" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires" TIMESTAMP(3);
