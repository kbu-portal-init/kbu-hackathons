import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { getOrganizerProfile } from "@/lib/data/organizer-profile";
import { OrganizerProfileSettings } from "./_components/organizer-profile-settings";

export default async function PanelSettingsPage() {
    const session = await requireOrganizerOrAdmin();
    if (session.user.role === "admin") redirect("/admin/settings");

    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Organizer settings"
                description="Manage your profile and password."
            />
            <Suspense fallback={<DashboardFormSkeleton />}>
                <OrganizerSettingsContent userId={session.user.id} />
            </Suspense>
        </main>
    );
}

async function OrganizerSettingsContent({ userId }: { userId: string }) {
    const profile = await getOrganizerProfile(userId);

    if (!profile) return null;

    return <OrganizerProfileSettings profile={profile} />;
}
