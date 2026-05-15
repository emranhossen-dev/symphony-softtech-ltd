-- CreateTable
CREATE TABLE "call_records" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "calleeName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "notes" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "call_records" ADD CONSTRAINT "call_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
