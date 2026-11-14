-- Existing tokens have no provable recipient; invalidate them before requiring it.
DELETE FROM "student_email_verification";
ALTER TABLE "student_email_verification" ADD COLUMN "studentEmail" TEXT NOT NULL;
