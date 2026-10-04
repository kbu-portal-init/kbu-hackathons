import { DashboardPageHeader } from "@/components/dashboard-page-header";

export default function PanelPage() {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management access"
                title="Management panel"
                description="Manage event settings, registrations, teams, announcements, and participant communication."
            />
        </main>
    );
}
