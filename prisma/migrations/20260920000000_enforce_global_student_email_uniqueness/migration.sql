-- DropIndex
DROP INDEX IF EXISTS "team_member_teamId_studentEmail_key";

-- CreateIndex
CREATE UNIQUE INDEX "team_member_student_email_key" ON "team_member"("studentEmail");
