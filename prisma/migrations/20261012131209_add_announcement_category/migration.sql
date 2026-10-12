-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('IMPORTANT', 'UPDATES', 'NEWS');

-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "category" "AnnouncementCategory" NOT NULL DEFAULT 'NEWS';
