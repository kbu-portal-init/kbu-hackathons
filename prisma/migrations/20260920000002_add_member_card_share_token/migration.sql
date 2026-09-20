-- AlterTable
ALTER TABLE "team_member" ADD COLUMN "cardShareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "team_member_cardShareToken_key" ON "team_member"("cardShareToken");
