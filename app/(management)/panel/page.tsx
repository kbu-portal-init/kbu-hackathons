import Link from "next/link";
import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardStatGridSkeleton } from "@/components/dashboard-skeletons";
import { PosterPanel } from "@/components/poster-panel";
import { Badge } from "@/components/ui/badge";
import { listAnnouncements } from "@/lib/data/announcements";
import { getEventSettings } from "@/lib/data/event-settings";
import { listRegistrations } from "@/lib/data/registrations";
import { listTeams } from "@/lib/data/teams";
import { managementDashboardLinks } from "@/lib/navigation";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
});

const cardClass = "border-2 border-border bg-card p-5 transition-colors hover:bg-accent hover:text-accent-foreground";

const quickLinks = managementDashboardLinks.filter((link) => link.href !== "/panel");

export default function PanelPage() {
    return (
        <main className="space-y-8">
            <DashboardPageHeader
                eyebrow="Management access"
                title="Management panel"
                description="Manage event settings, registrations, teams, announcements, and participant communication."
            />
            <Suspense fallback={<DashboardStatGridSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3" />}>
                <PanelOverview />
            </Suspense>
            <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className={cardClass}>
                        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
                            <Icon className="size-4" aria-hidden="true" />
                            {label}
                        </h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}

async function PanelOverview() {
    const [registrations, pending, approved, rejected, teams, announcements, settings] = await Promise.all([
        listRegistrations({ page: 1, pageSize: 1 }),
        listRegistrations({ page: 1, pageSize: 1, status: "PENDING" }),
        listRegistrations({ page: 1, pageSize: 1, status: "APPROVED" }),
        listRegistrations({ page: 1, pageSize: 1, status: "REJECTED" }),
        listTeams({ page: 1, pageSize: 1 }),
        listAnnouncements({ page: 1, pageSize: 1 }),
        getEventSettings(),
    ]);

    const cards = [
        ["Registrations", registrations.meta.total, "/panel/registrations"],
        ["Pending review", pending.meta.total, "/panel/registrations"],
        ["Approved", approved.meta.total, "/panel/registrations"],
        ["Rejected", rejected.meta.total, "/panel/registrations"],
        ["Approved teams", teams.meta.total, "/panel/teams"],
        ["Announcements", announcements.meta.total, "/panel/announcements"],
    ] as const;

    const now = Date.now();
    const opensAt = settings ? new Date(settings.registrationOpensAt) : null;
    const closesAt = settings ? new Date(settings.registrationClosesAt) : null;
    const isOpen = opensAt !== null && closesAt !== null && now >= opensAt.getTime() && now <= closesAt.getTime();
    const status = isOpen ? "Open" : opensAt !== null && now < opensAt.getTime() ? "Not started" : "Closed";

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map(([label, value, href]) => (
                    <Link key={label} href={href} className={cardClass}>
                        <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">{value}</p>
                    </Link>
                ))}
            </div>
            <PosterPanel className="flex flex-wrap items-center justify-between gap-3 border-border/15 p-5">
                {opensAt && closesAt ? (
                    <>
                        <div>
                            <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Registration window
                            </p>
                            <p className="mt-2 text-sm text-foreground">
                                {dateFormatter.format(opensAt)} — {dateFormatter.format(closesAt)}
                            </p>
                        </div>
                        <Badge variant={isOpen ? "accent" : "secondary"}>{status}</Badge>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">Event settings have not been configured yet.</p>
                        <Link
                            href="/panel/event"
                            className="font-display text-sm font-semibold text-foreground underline"
                        >
                            Set up the event
                        </Link>
                    </>
                )}
            </PosterPanel>
        </div>
    );
}
