"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
    title: string;
    text?: string;
};

export function ShareButton({ title, text = title }: ShareButtonProps) {
    async function handleShare() {
        try {
            const url = window.location.href;

            if (navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }

            if (!navigator.clipboard) {
                throw new Error("Clipboard is unavailable");
            }

            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            toast.error("Unable to share link");
        }
    }

    return (
        <Button type="button" onClick={handleShare} className="rounded-full">
            <Share2 data-icon="inline-start" />
            Share
        </Button>
    );
}
