"use client";

import { cn } from "cn";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";

type ShareButtonProps = {
    title: string;
    text?: string;
    url?: string;
    className?: string;
};

function isMobileDevice() {
    return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function ShareButton({ title, text = title, url, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [canUseNativeShare, setCanUseNativeShare] = useState(false);

    useEffect(() => {
        setCanUseNativeShare(isMobileDevice() && "share" in navigator && typeof navigator.share === "function");
    }, []);

    async function copyLink() {
        const shareUrl = url ?? window.location.href;
        if (!navigator.clipboard) throw new Error("Clipboard is unavailable");
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied");
        window.setTimeout(() => setCopied(false), 2000);
    }

    async function handleShare() {
        try {
            const shareUrl = url ?? window.location.href;

            if (isMobileDevice() && navigator.share) {
                await navigator.share({ title, text, url: shareUrl });
                return;
            }

            await copyLink();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            toast.error("Unable to share link");
        }
    }

    async function handleCopy() {
        try {
            await copyLink();
        } catch {
            toast.error("Unable to copy link");
        }
    }

    const trigger = (
        <Button
            size="lg"
            type="button"
            variant="outline"
            className={cn(
                "transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground",
                className,
            )}
        >
            <Share2 data-icon="inline-start" />
            Share
        </Button>
    );

    if (canUseNativeShare) {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={handleShare}
                className={cn(
                    "rounded-full transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground",
                    className,
                )}
            >
                <Share2 data-icon="inline-start" />
                Share
            </Button>
        );
    }

    return (
        <Popover>
            <PopoverTrigger render={trigger} />
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>Share this link</PopoverTitle>
                    <PopoverDescription>Copy the link or share it through LINE.</PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-1">
                    <Button type="button" variant="outline" onClick={handleCopy}>
                        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                        {copied ? "Copied" : "Copy link"}
                    </Button>
                    <Button
                        render={
                            <a
                                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url ?? (typeof window !== "undefined" ? window.location.href : ""))}`}
                                target="_blank"
                                rel="noreferrer"
                            />
                        }
                        variant="outline"
                    >
                        <ExternalLink data-icon="inline-start" />
                        Share to LINE
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
