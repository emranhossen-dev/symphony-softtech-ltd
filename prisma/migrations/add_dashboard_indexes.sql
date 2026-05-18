-- Add indexes for dashboard performance optimization
-- These indexes will significantly speed up the admin dashboard queries

-- Index for enrollments table
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON "enrollments"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON "enrollments"("enrollmentStatus");
CREATE INDEX IF NOT EXISTS idx_enrollments_category_id ON "enrollments"("categoryId");
CREATE INDEX IF NOT EXISTS idx_enrollments_status_created_at ON "enrollments"("enrollmentStatus", "createdAt" DESC);

-- Index for payments table  
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON "payments"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON "payments"("paymentStatus");
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON "payments"("paymentStatus", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON "payments"("amount");

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_enrollments_dashboard ON "enrollments"("enrollmentStatus", "createdAt" DESC, "categoryId");
