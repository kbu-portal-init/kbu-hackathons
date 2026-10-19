import type { EducationProgram } from "@/lib/contracts/registration";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { programLabels } from "./constants";

function initials(name: string | undefined) {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** `names[0]` is the leader, the rest are the other members. */
export function RosterSummary({
    teamName,
    program,
    names,
    teamSize,
    locale,
}: {
    teamName: string | undefined;
    program: EducationProgram | undefined;
    names: string[];
    teamSize: number;
    locale: Locale;
}) {
    const t = getMessages(locale).register;
    const th = locale === "th";
    const namedCount = names.filter((n) => n.trim().length > 0).length;

    return (
        <div className="overflow-hidden border-2 border-border bg-card">
            <div className="border-b-2 border-border bg-accent text-accent-foreground px-5 py-4">
                <p className="truncate font-display text-lg font-bold leading-6 text-foreground">
                    {teamName?.trim() || (th ? "ทีมของคุณ" : "Your team")}
                </p>
                <p className="text-sm leading-5 text-foreground/75">
                    {program ? programLabels[program] : th ? "ยังไม่เลือกหลักสูตร" : "No program yet"}
                </p>
            </div>
            <div className="px-5 py-4">
                <div className="flex items-baseline justify-between">
                    <p className="font-display text-sm font-semibold text-foreground">{th ? "รายชื่อทีม" : "Roster"}</p>
                    <p className="text-sm text-muted-foreground">
                        {namedCount}/{teamSize} {th ? "ชื่อแล้ว" : "named"}
                    </p>
                </div>
                <ul className="mt-3 space-y-2">
                    {Array.from({ length: teamSize }, (_, i) => {
                        const name = names[i] ?? "";
                        const filled = name.trim().length > 0;
                        return (
                            <li
                                // biome-ignore lint/suspicious/noArrayIndexKey: roster slots are positional
                                key={i}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className={[
                                        "flex size-8 shrink-0 items-center justify-center border-2 font-display text-xs font-bold",
                                        filled
                                            ? "border-border bg-accent text-accent-foreground"
                                            : "border-dashed border-border/30 text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {filled ? initials(name) : i + 1}
                                </span>
                                <span
                                    className={[
                                        "truncate text-sm",
                                        filled ? "text-foreground" : "text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {filled
                                        ? name
                                        : i === 0
                                          ? th
                                              ? "หัวหน้าทีม"
                                              : "Team leader"
                                          : th
                                            ? `สมาชิกคนที่ ${i}`
                                            : `Member ${i}`}
                                </span>
                                {i === 0 ? (
                                    <span className="ml-auto border-2 border-border/20 bg-secondary px-2 py-0.5 font-display text-[10px] font-semibold text-secondary-foreground">
                                        {t.leaderRole}
                                    </span>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
