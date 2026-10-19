"use client";

import { useState } from "react";
import { markTeamNotificationRead } from "@/actions/participant/notifications";
import { PosterButton } from "@/components/poster";
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
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                    Notifications
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {unread} unread notification{unread === 1 ? "" : "s"}.
                </p>
            </div>
            {items.length === 0 ? (
                <p className="border-2 border-border bg-card p-6 text-sm text-muted-foreground">
                    No notifications yet.
                </p>
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
                                    <PosterButton
                                        tone="outline"
                                        size="sm"
                                        className="border-2 border-border font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => markRead(item.id)}
                                    >
                                        Mark as read
                                    </PosterButton>
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
