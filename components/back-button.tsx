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
        <Button variant="outline" onClick={handleBack} className={`${className ? ` ${className}` : ""}`}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {label}
        </Button>
    );
}
