"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
    fallbackHref?: string;
    label?: string;
    className?: string;
};

export function BackButton({ fallbackHref = "/", label = "Back", className }: BackButtonProps) {
    const router = useRouter();

    function handleBack() {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push(fallbackHref);
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary${className ? ` ${className}` : ""}`}
        >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {label}
        </button>
    );
}
