import { TeamMemberRole } from "@/generated/prisma/enums";
import type { EducationProgram } from "@/lib/contracts/registration";
import { formatRole } from "@/lib/util";

export const programLabels: Record<EducationProgram, string> = {
    THAI_PROGRAM: "Thai program",
    INTERNATIONAL_PROGRAM: "International program",
};

export const roleOptions = [
    { value: TeamMemberRole.DEVELOPER, label: formatRole(TeamMemberRole.DEVELOPER) },
    { value: TeamMemberRole.DESIGNER, label: formatRole(TeamMemberRole.DESIGNER) },
    { value: TeamMemberRole.PRODUCT_MANAGER, label: formatRole(TeamMemberRole.PRODUCT_MANAGER) },
    { value: TeamMemberRole.MARKETER, label: formatRole(TeamMemberRole.MARKETER) },
    { value: TeamMemberRole.PRESENTER, label: formatRole(TeamMemberRole.PRESENTER) },
    { value: TeamMemberRole.RESEARCHER, label: formatRole(TeamMemberRole.RESEARCHER) },
    { value: TeamMemberRole.TESTER, label: formatRole(TeamMemberRole.TESTER) },
    { value: TeamMemberRole.OTHER, label: formatRole(TeamMemberRole.OTHER) },
] as const;
