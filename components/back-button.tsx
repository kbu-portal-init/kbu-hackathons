"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

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
        <Button
            variant="outline"
            onClick={handleBack}
            className={`rounded-none border-2 border-brand-ink bg-transparent font-display text-sm font-semibold text-brand-ink hover:border-brand-ink hover:bg-brand-yellow hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className ? ` ${className}` : ""}`}
        >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {label}
        </Button>
    );
}
