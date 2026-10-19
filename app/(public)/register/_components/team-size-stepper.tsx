"use client";

import { Minus, Plus, User } from "lucide-react";
import { PosterButton } from "@/components/poster";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function TeamSizeStepper({
    value,
    min,
    max,
    onChange,
    labelledBy,
    locale,
}: {
    value: number;
    min: number;
    max: number;
    onChange: (next: number) => void;
    labelledBy: string;
    locale: Locale;
}) {
    const t = getMessages(locale).register;
    const th = locale === "th";
    const seats = Array.from({ length: max }, (_, i) => i + 1);

    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-2 border-border/15 bg-background p-3 sm:justify-start">
            <PosterButton
                tone="outline"
                type="button"
                size="icon"
                aria-label={th ? "ลดสมาชิก" : "Remove a member"}
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
                className="border-2 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
            >
                <Minus className="size-4" />
            </PosterButton>
            <output aria-labelledby={labelledBy} className="min-w-24 text-center">
                <span className="block font-display text-3xl font-bold leading-none tabular-nums text-foreground">
                    {value}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{t.membersLabel}</span>
            </output>
            <PosterButton
                tone="outline"
                type="button"
                size="icon"
                aria-label={th ? "เพิ่มสมาชิก" : "Add a member"}
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
                className="border-2 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
            >
                <Plus className="size-4" />
            </PosterButton>
            <div
                aria-hidden
                className="flex basis-full items-center justify-center gap-1.5 border-t-2 border-border/15 pt-3 sm:ml-auto sm:basis-auto sm:border-t-0 sm:pt-0"
            >
                {seats.map((seat) => (
                    <User key={seat} className={seat <= value ? "size-6 text-primary" : "size-6 text-foreground/15"} />
                ))}
            </div>
        </div>
    );
}
