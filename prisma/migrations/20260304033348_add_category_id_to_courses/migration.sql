/*
  Warnings:

  - You are about to drop the column `category` on the `enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

