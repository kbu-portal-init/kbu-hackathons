import { requireAdmin } from "@/lib/auth/guards";
import { getAdminProfile } from "@/lib/data/admin-profile";
import { AdminProfileSettings } from "./_components/admin-profile-settings";

export default async function AdminSettingsPage() {
    const session = await requireAdmin();

    const profile = await getAdminProfile(session.user.id);

    if (!profile) return null;

    return (
        <main className="space-y-8">
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                    Administrator workspace
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin settings</h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">Manage your administrator profile and password.</p>
            </div>
            <AdminProfileSettings profile={profile} />
        </main>
    );
}
