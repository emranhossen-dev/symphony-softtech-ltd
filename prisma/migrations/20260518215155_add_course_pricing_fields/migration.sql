-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "discountPercent" INTEGER DEFAULT 0,
ADD COLUMN     "originalPrice" DOUBLE PRECISION;
