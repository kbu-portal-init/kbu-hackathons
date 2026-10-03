import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { getOrganizerProfile } from "@/lib/data/organizer-profile";
import { OrganizerProfileSettings } from "./_components/organizer-profile-settings";

export default async function PanelSettingsPage() {
    const session = await requireOrganizerOrAdmin();
    if (session.user.role === "admin") redirect("/admin/settings");

    return (
        <main className="space-y-8">
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Management workspace</p>
                <h1 className="text-2xl font-semibold tracking-tight">Organizer settings</h1>
                <p className="mt-1 text-muted-foreground">Manage your profile and password.</p>
            </div>
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
