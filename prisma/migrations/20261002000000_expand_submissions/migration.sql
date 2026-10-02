ALTER TABLE "submission" ADD COLUMN "summary" TEXT;
ALTER TABLE "submission" ADD COLUMN "problem" TEXT;
ALTER TABLE "submission" ADD COLUMN "targetUsers" TEXT;
ALTER TABLE "submission" ADD COLUMN "solution" TEXT;
ALTER TABLE "submission" ADD COLUMN "technologyStack" TEXT;
ALTER TABLE "submission" ADD COLUMN "demoVideoUrl" TEXT;
ALTER TABLE "submission" ADD COLUMN "additionalNotes" TEXT;
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REOPENED');
ALTER TABLE "submission" ADD COLUMN "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT';
UPDATE "submission"
SET "summary" = COALESCE("description", 'Existing submission summary'),
    "problem" = COALESCE("description", 'Problem statement to be completed'),
    "targetUsers" = 'To be completed',
    "solution" = COALESCE("description", 'Solution description to be completed'),
    "technologyStack" = 'To be completed',
    "repositoryUrl" = COALESCE("repositoryUrl", 'https://github.com/');
ALTER TABLE "submission" ALTER COLUMN "summary" SET NOT NULL;
ALTER TABLE "submission" ALTER COLUMN "problem" SET NOT NULL;
ALTER TABLE "submission" ALTER COLUMN "targetUsers" SET NOT NULL;
ALTER TABLE "submission" ALTER COLUMN "solution" SET NOT NULL;
ALTER TABLE "submission" ALTER COLUMN "technologyStack" SET NOT NULL;
ALTER TABLE "submission" ALTER COLUMN "repositoryUrl" SET NOT NULL;
ALTER TABLE "submission" DROP COLUMN "description";
