CREATE TYPE "EducationProgram" AS ENUM ('THAI_PROGRAM', 'INTERNATIONAL_PROGRAM');
ALTER TABLE "team" ADD COLUMN "program" "EducationProgram" NOT NULL DEFAULT 'THAI_PROGRAM';
ALTER TABLE "team" ALTER COLUMN "program" DROP DEFAULT;
ALTER TABLE "event_settings" ADD COLUMN "maxThaiTeams" INTEGER;
ALTER TABLE "event_settings" ADD COLUMN "maxInternationalTeams" INTEGER;
UPDATE "event_settings"
SET "maxThaiTeams" = "maxTeams",
    "maxInternationalTeams" = "maxTeams";
ALTER TABLE "event_settings" ALTER COLUMN "maxThaiTeams" SET NOT NULL;
ALTER TABLE "event_settings" ALTER COLUMN "maxInternationalTeams" SET NOT NULL;
ALTER TABLE "event_settings" DROP COLUMN "maxTeams";
