"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareCardButton() {
    async function shareCard() {
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title: "KBU Hackathon participant card", url });
                return;
            }
            if (!navigator.clipboard) throw new Error("Clipboard is unavailable");
            await navigator.clipboard.writeText(url);
            toast.success("Card link copied");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            toast.error("Unable to share card link");
        }
    }

    return (
        <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-600 px-6 py-4 text-base font-bold leading-6 text-white shadow-[5px_5px_0_#18181b,0_0_20px_rgba(249,115,22,0.4)] transition hover:-translate-x-px hover:-translate-y-px hover:bg-orange-600 hover:shadow-[5px_5px_0_#18181b,0_0_30px_rgba(249,115,22,0.6)] focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-4"
            onClick={shareCard}
            type="button"
        >
            <Share2 className="size-4" />
            Share this card
        </button>
    );
}
