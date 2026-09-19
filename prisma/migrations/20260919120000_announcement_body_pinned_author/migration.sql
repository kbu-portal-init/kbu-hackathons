-- AlterTable: align announcements with the panel composer (body/pinned/author naming)
ALTER TABLE "announcement" RENAME COLUMN "content" TO "body";
ALTER TABLE "announcement" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
DROP INDEX IF EXISTS "announcement_createdById_idx";
ALTER TABLE "announcement" RENAME COLUMN "createdById" TO "authorId";
ALTER TABLE "announcement" RENAME CONSTRAINT "announcement_createdById_fkey" TO "announcement_authorId_fkey";
CREATE INDEX IF NOT EXISTS "announcement_authorId_idx" ON "announcement"("authorId");