"use client";

import type { EducationProgram } from "@/lib/contracts/registration";
import { getMessages } from "@/lib/i18n/messages";
import { programLabels } from "./constants";
import type { Locale, ProgramSlot } from "./types";

export function ProgramPicker({
    name,
    value,
    onChange,
    onBlur,
    invalid,
    slots,
    labelledBy,
    locale,
}: {
    name: string;
    value: EducationProgram | undefined;
    onChange: (program: EducationProgram) => void;
    onBlur: () => void;
    invalid: boolean;
    slots: ProgramSlot[];
    labelledBy: string;
    locale: Locale;
}) {
    const t = getMessages(locale).register;
    const th = locale === "th";

    return (
        <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => {
                const selected = value === slot.program;
                const full = slot.remaining <= 0;
                const pct = slot.limit > 0 ? Math.round((slot.remaining / slot.limit) * 100) : 0;
                return (
                    <label
                        key={slot.program}
                        className={[
                            "block border-2 p-4 text-left transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary",
                            selected
                                ? "border-border bg-accent text-accent-foreground"
                                : "border-border/20 bg-card hover:border-border",
                            full ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                            invalid && !selected ? "border-destructive" : "",
                        ].join(" ")}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={slot.program}
                            checked={selected}
                            disabled={full}
                            onChange={() => onChange(slot.program)}
                            onBlur={onBlur}
                            className="sr-only"
                        />
                        <span className="flex items-center justify-between gap-2">
                            <span className="font-display font-semibold text-foreground">
                                {programLabels[slot.program]}
                            </span>
                            <span
                                aria-hidden
                                className={[
                                    "flex size-5 items-center justify-center border-2",
                                    selected ? "border-border bg-foreground" : "border-border/30",
                                ].join(" ")}
                            >
                                {selected ? <span className="size-2 bg-background" /> : null}
                            </span>
                        </span>
                        <span className="mt-3 block h-1.5 overflow-hidden bg-foreground/10">
                            <span className="block h-full bg-primary" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="mt-2 block text-sm text-muted-foreground">
                            {full ? (th ? "เต็มแล้ว" : "Full") : `${slot.remaining} of ${slot.limit} ${t.slotsLeft}`}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
