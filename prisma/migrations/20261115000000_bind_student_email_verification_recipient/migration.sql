DELETE FROM "student_email_verification";

ALTER TABLE "student_email_verification"
ADD COLUMN "recipientEmail" TEXT NOT NULL;
