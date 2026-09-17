-- AlterTable
ALTER TABLE "alerts" ADD COLUMN IF NOT EXISTS "target_price_min" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "notification_logs" ADD COLUMN IF NOT EXISTS "message" TEXT;

-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN IF NOT EXISTS "target_price_min" DOUBLE PRECISION;
