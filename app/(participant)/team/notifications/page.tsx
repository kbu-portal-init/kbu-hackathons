import { Suspense } from "react";
import { countTeamUnreadNotifications, listTeamNotifications } from "@/actions/participant/notifications";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DashboardListSkeleton } from "@/components/dashboard-skeletons";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { NotificationInbox } from "./_components/notification-inbox";

export default async function TeamNotificationsPage() {
    const locale = await getLocale();
    const t = getMessages(locale).notificationsPage;

    return (
        <main className="space-y-8">
            <DashboardPageHeader title={t.title} description={t.description} />
            <Suspense fallback={<DashboardListSkeleton />}>
                <TeamNotificationsContent locale={locale} />
            </Suspense>
        </main>
    );
}

async function TeamNotificationsContent({ locale }: { locale: Locale }) {
    const [result, unreadCount] = await Promise.all([
        listTeamNotifications({ page: 1, pageSize: 50 }),
        countTeamUnreadNotifications(),
    ]);

    return <NotificationInbox initial={result.ok ? result.data.items : []} locale={locale} unreadCount={unreadCount} />;
}
