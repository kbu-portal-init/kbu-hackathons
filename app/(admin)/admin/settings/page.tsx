import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminProfile } from "@/lib/data/admin-profile";
import { AdminProfileSettings } from "./_components/admin-profile-settings";

export default async function AdminSettingsPage() {
    const session = await requireAdmin();

    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Administrator access"
                title="Admin settings"
                description="Manage your administrator profile and password."
            />
            <Suspense fallback={<DashboardFormSkeleton />}>
                <AdminSettingsContent userId={session.user.id} />
            </Suspense>
        </main>
    );
}

async function AdminSettingsContent({ userId }: { userId: string }) {
    const profile = await getAdminProfile(userId);

    if (!profile) return null;

    return <AdminProfileSettings profile={profile} />;
}
