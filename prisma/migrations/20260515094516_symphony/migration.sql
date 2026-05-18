-- CreateEnum
CREATE TYPE "SeminarStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('NEW_APPLICANT', 'FIRST_TIME_APPLIED', 'CALLED', 'CONFIRMED', 'WAITING_NEXT_SEMINAR', 'REJECTED', 'CANCELLED', 'NEXT_SEMINAR_CONFIRMED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('NOT_CALLED', 'SCHEDULED', 'COMPLETED', 'NO_ANSWER', 'CALLBACK_REQUESTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('INITIAL', 'FOLLOWUP', 'CONFIRMATION', 'REMINDER');

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "description" TEXT,
ADD COLUMN     "topics" TEXT[];

-- CreateTable
CREATE TABLE "seminars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "registrationUrl" TEXT NOT NULL,
    "status" "SeminarStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "seminars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seminar_registrations" (
    "id" TEXT NOT NULL,
    "seminarId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "whyJoin" TEXT NOT NULL,
    "experience" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'NEW_APPLICANT',
    "callStatus" "CallStatus" DEFAULT 'NOT_CALLED',
    "notes" TEXT,
    "hasWhatsApp" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_history" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "callType" "CallType" NOT NULL DEFAULT 'INITIAL',
    "callStatus" "CallStatus" NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seminars" ADD CONSTRAINT "seminars_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "seminars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "seminar_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
