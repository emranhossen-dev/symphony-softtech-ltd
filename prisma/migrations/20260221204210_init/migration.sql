-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GOVERNMENT', 'RECORDED', 'ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING_REVIEW', 'PAYMENT_PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "educationLevel" TEXT,
    "whyJoin" TEXT,
    "preferredBatchTime" TEXT,
    "enrollmentStatus" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
