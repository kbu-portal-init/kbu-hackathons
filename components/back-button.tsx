"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PosterButton } from "@/components/poster";

type BackButtonProps = {
    fallbackHref?: string;
    label?: string;
    className?: string;
    useHistory?: boolean;
};

export function BackButton({ fallbackHref = "/", label = "Back", className, useHistory = true }: BackButtonProps) {
    const router = useRouter();

    function handleBack() {
        if (useHistory && window.history.length > 1) {
            router.back();
            return;
        }

        router.push(fallbackHref);
    }

    return (
        <PosterButton
            tone="outline"
            onClick={handleBack}
            className={`border-2 border-border bg-transparent font-display text-sm font-semibold text-foreground hover:border-border hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className ? ` ${className}` : ""}`}
        >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {label}
        </PosterButton>
    );
}
