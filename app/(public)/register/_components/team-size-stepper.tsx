"use client";

import { Minus, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background p-3">
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={th ? "ลดสมาชิก" : "Remove a member"}
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
            >
                <Minus className="size-4" />
            </Button>
            <output aria-labelledby={labelledBy} className="min-w-24 text-center">
                <span className="block text-3xl font-black leading-none tabular-nums text-foreground">{value}</span>
                <span className="mt-1 block text-sm text-brand-muted-foreground">{t.membersLabel}</span>
            </output>
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={th ? "เพิ่มสมาชิก" : "Add a member"}
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
            >
                <Plus className="size-4" />
            </Button>
            <div aria-hidden className="ml-auto hidden items-center gap-1 sm:flex">
                {seats.map((seat) => (
                    <User key={seat} className={seat <= value ? "size-5 text-primary" : "size-5 text-border"} />
                ))}
            </div>
        </div>
    );
}
