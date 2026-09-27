import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { getOrganizerProfile } from "@/lib/data/organizer-profile";
import { OrganizerProfileSettings } from "./_components/organizer-profile-settings";

export default async function PanelSettingsPage() {
    const session = await requireOrganizerOrAdmin();
    if (session.user.role !== "organizer") return null;
    const profile = await getOrganizerProfile(session.user.id);
    if (!profile) return null;
    return (
        <main className="space-y-8">
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Management workspace</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Organizer settings</h1>
                <p className="mt-2 text-zinc-600">Manage your profile and password.</p>
            </div>
            <OrganizerProfileSettings profile={profile} />
        </main>
    );
}
