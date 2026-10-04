import { DashboardPageHeader } from "@/components/dashboard-page-header";

export default function PanelOrganizersPage() {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management workspace"
                title="Organizers"
                description="Organizer roles, contact details, and access management will appear here."
            />
        </main>
    );
}
