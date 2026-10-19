"use client";

import { useState } from "react";
import { markTeamNotificationRead } from "@/actions/participant/notifications";
import { Button } from "@/components/ui/button";
import type { NotificationDTO } from "@/lib/contracts/notifications";

export function NotificationInbox({ initial, unreadCount }: { initial: NotificationDTO[]; unreadCount: number }) {
    const [items, setItems] = useState(initial);
    const [unread, setUnread] = useState(unreadCount);
    const formatNotificationDate = (value: string) =>
        new Date(value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em] text-brand-ink">
                    Notifications
                </h1>
                <p className="mt-2 text-sm text-brand-muted-foreground">
                    {unread} unread notification{unread === 1 ? "" : "s"}.
                </p>
            </div>
            {items.length === 0 ? (
                <p className="rounded-none border-2 border-brand-ink bg-card p-6 text-sm text-brand-muted-foreground">
                    No notifications yet.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className={`border-2 p-5 ${
                                item.readAt ? "border-brand-ink/15 bg-card" : "border-brand-ink bg-brand-yellow"
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-brand-ink">
                                        {item.subject}
                                    </h2>
                                    <p className="mt-1 text-xs text-brand-muted-foreground">
                                        {formatNotificationDate(item.createdAt)}
                                    </p>
                                </div>
                                {!item.readAt && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-none border-2 border-brand-ink font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow"
                                        onClick={() => markRead(item.id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                            <p className="mt-4 whitespace-pre-wrap text-sm text-brand-muted-foreground">{item.body}</p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
