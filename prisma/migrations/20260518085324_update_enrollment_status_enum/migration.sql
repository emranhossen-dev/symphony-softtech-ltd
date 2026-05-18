/*
  Warnings:

  - The values [PENDING_REVIEW,PAYMENT_PENDING,APPROVED,PAYMENT_CANCELLED] on the enum `EnrollmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EnrollmentStatus_new" AS ENUM ('APPLIED', 'ADMITTED', 'REJECTED', 'WAITING', 'NEXT_BATCH');
ALTER TABLE "enrollments" ALTER COLUMN "enrollmentStatus" DROP DEFAULT;
ALTER TABLE "enrollments" ALTER COLUMN "enrollmentStatus" TYPE "EnrollmentStatus_new" USING ("enrollmentStatus"::text::"EnrollmentStatus_new");
ALTER TYPE "EnrollmentStatus" RENAME TO "EnrollmentStatus_old";
ALTER TYPE "EnrollmentStatus_new" RENAME TO "EnrollmentStatus";
DROP TYPE "EnrollmentStatus_old";
ALTER TABLE "enrollments" ALTER COLUMN "enrollmentStatus" SET DEFAULT 'APPLIED';
COMMIT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "enrollments" ALTER COLUMN "enrollmentStatus" SET DEFAULT 'APPLIED';
