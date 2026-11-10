import { CalendarDays, Clock3, Flag, MapPin, Timer, Users } from "lucide-react";
import type { ReactNode } from "react";
import { PosterPanel } from "@/components/poster-panel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventSettings } from "@/lib/data/event-settings";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { getSubmissionWindowState } from "@/lib/services/submission-window";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Confirmed by the organizers. The submission window still comes from event settings.
const REGISTRATION_OPENS_AT = "2026-11-11T00:00:00+07:00";
const HACKATHON_STARTS_AT = "2026-12-11T00:00:00+07:00";
const HACKATHON_ENDS_AT = "2026-12-12T23:59:59+07:00";

type EventGuideProps = {
    locale: Locale;
    t: Messages["references"];
};

function formatDate(value: string, locale: Locale, withTime = false): string {
    return new Intl.DateTimeFormat(locale === "th" ? "th-TH-u-ca-gregory" : "en-GB", {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" } : {}),
        timeZone: "Asia/Bangkok",
    }).format(new Date(value));
}

export async function EventGuide({ locale, t }: EventGuideProps) {
    const event = await getEventSettings();
    const now = new Date();

    const startsAt = new Date(HACKATHON_STARTS_AT);
    const endsAt = new Date(HACKATHON_ENDS_AT);
    const phase = now < startsAt ? "upcoming" : now > endsAt ? "completed" : "live";
    const duration = Math.max(1, Math.ceil((endsAt.getTime() - startsAt.getTime()) / MS_PER_DAY));
    const windowState = getSubmissionWindowState(event);
    const windowLabel = {
        OPEN: t.overview.submission.open,
        BEFORE_OPEN: t.overview.submission.before,
        CLOSED: t.overview.submission.closed,
        NOT_CONFIGURED: t.overview.submission.unknown,
    }[windowState];

    return (
        <div className="space-y-10">
            <section aria-labelledby="overview-title" className="scroll-mt-24" id="overview">
                <header className="max-w-2xl">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground" id="overview-title">
                        {t.overview.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t.overview.description}</p>
                </header>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Fact
                        icon={<CalendarDays className="size-5 text-primary" />}
                        label={t.overview.dates}
                        value={`${formatDate(startsAt.toISOString(), locale)} – ${formatDate(endsAt.toISOString(), locale)}`}
                        unavailable={t.overview.unavailable}
                    />
                    <Fact
                        icon={<MapPin className="size-5 text-primary" />}
                        label={t.overview.venue}
                        value={event?.venue ?? null}
                        unavailable={t.overview.notPublished}
                    />
                    <Fact
                        icon={<Users className="size-5 text-primary" />}
                        label={t.overview.teamSize}
                        value={event ? t.overview.teamSizeValue(event.minTeamSize, event.maxTeamSize) : null}
                        unavailable={t.overview.unavailable}
                    />
                    <Fact
                        icon={<Timer className="size-5 text-primary" />}
                        label={t.overview.duration}
                        value={t.overview.durationValue(duration)}
                        unavailable={t.overview.unavailable}
                    />
                    <Fact
                        icon={<Clock3 className="size-5 text-primary" />}
                        label={t.overview.deadline}
                        value={event ? formatDate(event.submissionDeadline, locale, true) : null}
                        unavailable={t.overview.unavailable}
                        aside={<Badge variant={windowState === "OPEN" ? "accent" : "secondary"}>{windowLabel}</Badge>}
                    />
                    <Fact
                        icon={<Flag className="size-5 text-primary" />}
                        label={t.overview.phase}
                        value={t.overview.phases[phase]}
                        unavailable={t.overview.unavailable}
                    />
                </dl>

                <p className="mt-3 text-xs text-muted-foreground">{t.overview.timezone}</p>
            </section>

            <section aria-labelledby="schedule-title" className="scroll-mt-24" id="schedule">
                <header className="max-w-2xl">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground" id="schedule-title">
                        {t.schedule.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t.schedule.description}</p>
                    <p className="mt-4 inline-flex flex-wrap items-center gap-2 border-2 border-border/15 bg-secondary px-4 py-3 text-sm font-medium text-foreground">
                        <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                        <span>
                            {t.schedule.registrationLabel}: {formatDate(REGISTRATION_OPENS_AT, locale)}
                        </span>
                    </p>
                </header>

                <ol className="mt-5 grid gap-4 md:grid-cols-2">
                    {[
                        {
                            label: t.schedule.day1Label,
                            date: formatDate(HACKATHON_STARTS_AT, locale),
                            title: t.schedule.day1Title,
                            body: t.schedule.day1Body,
                            items: t.schedule.day1Items,
                        },
                        {
                            label: t.schedule.day2Label,
                            date: formatDate(HACKATHON_ENDS_AT, locale),
                            title: t.schedule.day2Title,
                            body: t.schedule.day2Body,
                            items: t.schedule.day2Items,
                        },
                    ].map((day, index) => (
                        <li key={day.label}>
                            <PosterPanel className="flex h-full flex-col p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <Badge variant="accent">{day.label}</Badge>
                                        <p className="mt-2 text-xs font-medium text-muted-foreground">{day.date}</p>
                                    </div>
                                    <span className="font-display text-3xl font-bold leading-none text-border/40">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
                                    {day.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{day.body}</p>
                                <ul className="mt-4 space-y-2 border-t-2 border-border/15 pt-4 text-sm">
                                    {day.items.map((item) => (
                                        <li className="flex gap-2 text-foreground" key={item}>
                                            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </PosterPanel>
                        </li>
                    ))}
                </ol>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                        { label: t.schedule.day1Label, timeline: t.schedule.day1Timeline },
                        { label: t.schedule.day2Label, timeline: t.schedule.day2Timeline },
                    ].map((day) => (
                        <PosterPanel className="p-5" key={day.label}>
                            <h3 className="font-display text-base font-bold text-foreground">{day.label}</h3>
                            <dl className="mt-3 space-y-2">
                                {day.timeline.map((item) => (
                                    <div className="grid grid-cols-[6rem_1fr] gap-3 text-sm" key={item.time}>
                                        <dt className="font-medium text-muted-foreground">{item.time}</dt>
                                        <dd className="text-foreground">{item.activity}</dd>
                                    </div>
                                ))}
                            </dl>
                        </PosterPanel>
                    ))}
                </div>
            </section>
        </div>
    );
}

type FactProps = {
    icon: ReactNode;
    label: string;
    value: string | null;
    unavailable: string;
    aside?: ReactNode;
};

function Fact({ icon, label, value, unavailable, aside }: FactProps) {
    return (
        <PosterPanel className="p-5">
            {icon}
            <dt className="mt-4 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 font-semibold text-foreground">
                <span className={value ? undefined : "text-muted-foreground"}>{value ?? unavailable}</span>
                {aside}
            </dd>
        </PosterPanel>
    );
}

export function EventGuideSkeleton({ label }: { label: string }) {
    return (
        <div aria-label={label} className="space-y-10" role="status">
            <span className="sr-only">{label}</span>
            <div>
                <Skeleton className="h-7 w-48 bg-muted" />
                <Skeleton className="mt-2 h-4 w-64 max-w-full bg-muted" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {["one", "two", "three", "four", "five", "six"].map((key) => (
                        <PosterPanel className="p-5" key={key}>
                            <Skeleton className="size-5 bg-accent" />
                            <Skeleton className="mt-4 h-3 w-24 bg-muted" />
                            <Skeleton className="mt-2 h-5 w-40 max-w-full bg-muted" />
                        </PosterPanel>
                    ))}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {["one", "two"].map((key) => (
                    <PosterPanel className="p-6" key={key}>
                        <Skeleton className="h-5 w-16 bg-accent" />
                        <Skeleton className="mt-4 h-6 w-40 max-w-full bg-muted" />
                        <Skeleton className="mt-3 h-4 w-full bg-muted" />
                        <Skeleton className="mt-2 h-4 w-3/4 bg-muted" />
                    </PosterPanel>
                ))}
            </div>
        </div>
    );
}
