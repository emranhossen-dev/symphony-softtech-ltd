-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'PAYMENT_CANCELLED';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT;
