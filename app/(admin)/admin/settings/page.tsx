import { Suspense } from "react";
import { DashboardFormSkeleton } from "@/components/dashboard-skeletons";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminProfile } from "@/lib/data/admin-profile";
import { AdminProfileSettings } from "./_components/admin-profile-settings";

export default async function AdminSettingsPage() {
    const session = await requireAdmin();

    return (
        <main className="space-y-8">
            <div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin settings</h1>
                <p className="mt-2 text-muted-foreground">Manage your administrator profile and password.</p>
            </div>
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
