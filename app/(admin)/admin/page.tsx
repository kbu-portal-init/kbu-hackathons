import Link from "next/link";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardStatGridSkeleton } from "@/components/dashboard-skeletons";
import { getAdminOverview } from "@/lib/data/admin";

export default function AdminPage() {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Administrator access"
                title="Administrator panel"
                description="Overview of accounts, registrations, submissions, and platform management."
            />
            <Suspense fallback={<DashboardStatGridSkeleton />}>
                <AdminOverview />
            </Suspense>
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    ["Manage organizers", "/admin/organizers", "Create, update, and manage organizer access."],
                    ["Audit logs", "/admin/audits", "Review administrative activity."],
                    ["Platform settings", "/admin/settings", "Configure global platform preferences."],
                ].map(([title, href, description]) => (
                    <Link
                        key={href}
                        href={href}
                        className="group border-2 border-border bg-card p-5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground">{description}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}

async function AdminOverview() {
    const overview = await getAdminOverview();
    const cards = [
        ["Organizers", overview.organizerCount, "/admin/organizers"],
        ["Team accounts", overview.teamCount, "/panel/teams"],
        ["Banned accounts", overview.bannedAccountCount, "/admin/organizers"],
        ["Team members", overview.teamMemberCount, "/panel/teams"],
        ["Registrations", overview.registrationCount, "/panel/registrations"],
        ["Pending registrations", overview.pendingRegistrationCount, "/panel/registrations"],
        ["Approved registrations", overview.approvedRegistrationCount, "/panel/registrations"],
        ["Rejected registrations", overview.rejectedRegistrationCount, "/panel/registrations"],
        ["Submissions", overview.submissionCount, "/panel/teams"],
        ["Audit logs", overview.auditLogCount, "/admin/audits"],
        ["Announcements", overview.announcementCount, "/panel/announcements"],
        ["Pending verifications", overview.pendingVerificationCount, "/panel/teams"],
    ] as const;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value, href]) => (
                <Link
                    key={label}
                    href={href}
                    className="border-2 border-border bg-card p-5 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">{value}</p>
                </Link>
            ))}
        </div>
    );
}
