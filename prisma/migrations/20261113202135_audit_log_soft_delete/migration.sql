-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "deletedAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "audit_log_deletedAt_createdAt_idx" ON "audit_log"("deletedAt", "createdAt");
