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
                            "block rounded-xl border-2 p-4 text-left transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
                            selected
                                ? "border-primary bg-accent"
                                : "border-border/60 bg-background hover:border-primary/60",
                            full ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                            invalid && !selected ? "border-destructive/60" : "",
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
                            <span className="font-semibold text-foreground">{programLabels[slot.program]}</span>
                            <span
                                aria-hidden
                                className={[
                                    "flex size-5 items-center justify-center rounded-full border-2",
                                    selected ? "border-primary bg-primary" : "border-border",
                                ].join(" ")}
                            >
                                {selected ? <span className="size-2 rounded-full bg-primary-foreground" /> : null}
                            </span>
                        </span>
                        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-border/60">
                            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="mt-2 block text-sm text-brand-muted-foreground">
                            {full ? (th ? "เต็มแล้ว" : "Full") : `${slot.remaining} of ${slot.limit} ${t.slotsLeft}`}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
