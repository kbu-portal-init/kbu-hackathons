"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

type ShareAnnouncementButtonProps = {
    title: string;
};

export function ShareAnnouncementButton({ title }: ShareAnnouncementButtonProps) {
    async function shareAnnouncement() {
        try {
            const url = window.location.href;

            if (navigator.share) {
                await navigator.share({
                    title,
                    text: `Check out this announcement ${title}`,
                    url,
                });
                return;
            }

            if (!navigator.clipboard) {
                throw new Error("Clipboard is unavailable");
            }

            await navigator.clipboard.writeText(url);
            toast.success("Announcement link copied");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            toast.error("Unable to share announcement link");
        }
    }

    return (
        <button
            type="button"
            onClick={shareAnnouncement}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            <Share2 className="size-4" />
            Share
        </button>
    );
}
