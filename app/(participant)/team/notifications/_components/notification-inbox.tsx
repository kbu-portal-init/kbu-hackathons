"use client";

import { useState } from "react";
import { markTeamNotificationRead } from "@/actions/participant/notifications";
import { Button } from "@/components/ui/button";
import type { NotificationDTO } from "@/lib/contracts/notifications";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type NotificationInboxProps = {
    initial: NotificationDTO[];
    unreadCount: number;
    locale: Locale;
};

export function NotificationInbox({ initial, unreadCount, locale }: NotificationInboxProps) {
    const t = getMessages(locale).notificationsPage;
    const [items, setItems] = useState(initial);
    const [unread, setUnread] = useState(unreadCount);
    const formatNotificationDate = (value: string) =>
        new Intl.DateTimeFormat(locale === "th" ? "th-TH-u-ca-gregory" : "en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Bangkok",
        }).format(new Date(value));
    async function markRead(id: string) {
        const result = await markTeamNotificationRead({ notificationId: id });
        if (result.ok) {
            setItems((current) =>
                current.map((item) => (item.id === id ? { ...item, readAt: result.data.readAt } : item)),
            );
            setUnread((current) => Math.max(0, current - 1));
        }
    }
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t.unreadCount(unread)}</p>
            {items.length === 0 ? (
                <p className="border-2 border-border bg-card p-6 text-sm text-muted-foreground">{t.empty}</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className={`border-2 p-5 ${
                                item.readAt
                                    ? "border-border/15 bg-card"
                                    : "border-border bg-accent text-accent-foreground"
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                                        {item.subject}
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatNotificationDate(item.createdAt)}
                                    </p>
                                </div>
                                {!item.readAt && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => markRead(item.id)}
                                    >
                                        {t.markAsRead}
                                    </Button>
                                )}
                            </div>
                            <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
