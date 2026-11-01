import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, FileText, IdCard, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PosterPanel } from "@/components/poster-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { TeamOverviewDTO } from "@/lib/contracts/team-overview";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
    deriveTeamOverviewActions,
    getSubmissionWindowState,
    type TeamOverviewActionId,
} from "@/lib/services/team-overview";
import { formatRole } from "@/lib/util";

type TeamOverviewProps = {
    overview: TeamOverviewDTO;
    team: {
        loginName: string;
        program: "THAI_PROGRAM" | "INTERNATIONAL_PROGRAM";
    };
    locale: Locale;
};

export function TeamOverview({ overview, team, locale }: TeamOverviewProps) {
    const t = getMessages(locale).teamOverview;
    const intlLocale = locale === "th" ? "th-TH-u-ca-gregory" : "en-US";
    const formatDate = (value: string) =>
        new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(value));
    const formatDateTime = (value: string) =>
        new Intl.DateTimeFormat(intlLocale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Bangkok",
        }).format(new Date(value));

    const verifiedCount = overview.members.filter((member) => member.verifiedAt).length;
    const windowState = getSubmissionWindowState(overview.event);
    const actions = deriveTeamOverviewActions({
        unverifiedMemberCount: overview.members.length - verifiedCount,
        submissionStatus: overview.submission?.status ?? null,
        windowState,
        unreadNotificationCount: overview.notifications.unreadCount,
    });
    const statusLabel = overview.submission
        ? {
              DRAFT: t.submissionDraft,
              SUBMITTED: t.submissionSubmitted,
              REOPENED: t.submissionReopened,
          }[overview.submission.status]
        : t.submissionEmpty;
    const windowLabel = {
        OPEN: t.windowOpen,
        BEFORE_OPEN: t.windowBeforeOpen,
        CLOSED: t.windowClosed,
        NOT_CONFIGURED: t.windowNotConfigured,
    }[windowState];
    const canSubmit = windowState === "OPEN" && overview.submission?.status !== "SUBMITTED";

    return (
        <div className="space-y-6">
            <section aria-label={t.eyebrow} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <PosterPanel className="p-5">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.program}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                        {team.program === "THAI_PROGRAM" ? t.programThai : t.programInternational}
                    </p>
                </PosterPanel>
                <PosterPanel className="p-5">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.loginName}
                    </p>
                    <p className="mt-2 break-all text-lg font-semibold text-foreground">{team.loginName}</p>
                </PosterPanel>
                <PosterPanel className="p-5">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.approvedOn}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                        {overview.approvedAt ? formatDate(overview.approvedAt) : t.notRecorded}
                    </p>
                </PosterPanel>
                <PosterPanel className="p-5">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.membersTitle}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                        {t.verifiedCount(verifiedCount, overview.members.length)}
                    </p>
                </PosterPanel>
            </section>

            <section aria-labelledby="next-steps-heading">
                <PosterPanel className="p-6">
                    <h2
                        className="font-display text-xl font-bold tracking-tight text-foreground"
                        id="next-steps-heading"
                    >
                        {t.nextStepsTitle}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t.nextStepsDescription}</p>
                    <ol className="mt-4 space-y-3">
                        {actions.map((action, index) => {
                            const content = getActionContent(action, t);
                            const primary = index === 0;
                            const body = (
                                <>
                                    <span className="flex size-9 shrink-0 items-center justify-center border-2 border-border bg-background text-foreground">
                                        {primary ? (
                                            <AlertCircle className="size-4" />
                                        ) : (
                                            <CheckCircle2 className="size-4" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-display font-bold text-foreground">
                                            {content.title}
                                        </span>
                                        <span className="mt-1 block text-sm text-muted-foreground">
                                            {content.description}
                                        </span>
                                    </span>
                                    {content.href && <ArrowUpRight className="mt-1 size-4 shrink-0 text-primary" />}
                                </>
                            );
                            const className = `flex min-h-11 items-start gap-4 border-2 p-4 ${
                                primary ? "border-border bg-accent text-accent-foreground" : "border-border/15 bg-card"
                            }`;
                            return (
                                <li key={action}>
                                    {content.href ? (
                                        <Link
                                            className={`${className} transition-colors hover:bg-foreground hover:text-background`}
                                            href={content.href}
                                        >
                                            {body}
                                        </Link>
                                    ) : (
                                        <div className={className}>{body}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </PosterPanel>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
                <section aria-labelledby="submission-heading">
                    <PosterPanel className="flex h-full flex-col p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <h2
                                className="font-display text-xl font-bold tracking-tight text-foreground"
                                id="submission-heading"
                            >
                                {t.submissionTitle}
                            </h2>
                            <Badge variant={overview.submission ? "accent" : "secondary"}>{statusLabel}</Badge>
                        </div>

                        <div className="mt-4 flex-1 space-y-3 text-sm">
                            {overview.submission ? (
                                <>
                                    <p className="font-display text-lg font-bold text-foreground">
                                        {overview.submission.title}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {t.lastUpdated}: {formatDateTime(overview.submission.updatedAt)}
                                    </p>
                                    {overview.submission.submittedAt && (
                                        <p className="text-muted-foreground">
                                            {t.submittedOn}: {formatDateTime(overview.submission.submittedAt)}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-foreground">{t.submissionEmpty}</p>
                                    <p className="text-muted-foreground">{t.submissionEmptyDescription}</p>
                                </>
                            )}

                            <div className="border-2 border-border/15 bg-background p-3">
                                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    {t.window}
                                </p>
                                <p className="mt-1 font-semibold text-foreground">{windowLabel}</p>
                                {overview.event && (
                                    <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <div className="flex justify-between gap-3">
                                            <dt>{t.opensAt}</dt>
                                            <dd>{formatDateTime(overview.event.submissionOpensAt)}</dd>
                                        </div>
                                        <div className="flex justify-between gap-3">
                                            <dt>{t.deadline}</dt>
                                            <dd>{formatDateTime(overview.event.submissionDeadline)}</dd>
                                        </div>
                                    </dl>
                                )}
                            </div>

                            {overview.submission?.status === "SUBMITTED" && (
                                <p className="flex items-start gap-2 text-muted-foreground">
                                    <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t.lockedNote}
                                </p>
                            )}
                            {windowState === "CLOSED" && (
                                <p className="flex items-start gap-2 text-muted-foreground">
                                    <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t.closedNote}
                                </p>
                            )}
                        </div>

                        {canSubmit && (
                            <Link
                                className={`${buttonVariants({ variant: "brand" })} mt-5 self-start`}
                                href="/team/submit"
                            >
                                <FileText className="size-4" />
                                {t.submitCta}
                            </Link>
                        )}
                    </PosterPanel>
                </section>

                <section aria-labelledby="notifications-heading">
                    <PosterPanel className="flex h-full flex-col p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <h2
                                className="font-display text-xl font-bold tracking-tight text-foreground"
                                id="notifications-heading"
                            >
                                {t.notificationsTitle}
                            </h2>
                            <Badge variant={overview.notifications.unreadCount > 0 ? "accent" : "secondary"}>
                                {t.unreadCount(overview.notifications.unreadCount)}
                            </Badge>
                        </div>

                        <div className="mt-4 flex-1">
                            {overview.notifications.latest.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t.noNotifications}</p>
                            ) : (
                                <ul className="space-y-3">
                                    {overview.notifications.latest.map((notification) => (
                                        <li
                                            className="border-2 border-border/15 bg-background p-3"
                                            key={notification.id}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <p className="min-w-0 font-semibold text-foreground">
                                                    {notification.subject}
                                                </p>
                                                <Badge variant={notification.readAt ? "secondary" : "accent"}>
                                                    {notification.readAt ? t.read : t.unread}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDateTime(notification.createdAt)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <Link
                            className="mt-5 inline-flex min-h-11 items-center gap-1 self-start font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:bg-accent hover:text-accent-foreground"
                            href="/team/notifications"
                        >
                            {t.viewAllNotifications}
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </PosterPanel>
                </section>
            </div>

            <section aria-labelledby="members-heading">
                <PosterPanel className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2
                                className="font-display text-xl font-bold tracking-tight text-foreground"
                                id="members-heading"
                            >
                                {t.membersTitle}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t.membersDescription}</p>
                        </div>
                        <Link
                            className="inline-flex min-h-11 items-center gap-1 font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:bg-accent hover:text-accent-foreground"
                            href="/team/settings"
                        >
                            <Users className="size-4" />
                            {t.manageMembers}
                        </Link>
                    </div>

                    {overview.members.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">{t.membersDescription}</p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {overview.members.map((member) => (
                                <li
                                    className="flex flex-wrap items-center gap-3 border-2 border-border/15 bg-background p-3"
                                    key={member.id}
                                >
                                    {member.imageUrl ? (
                                        <Image
                                            alt={`${member.name} profile`}
                                            className="size-10 border-2 border-border object-cover"
                                            height={40}
                                            src={member.imageUrl}
                                            unoptimized
                                            width={40}
                                        />
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="flex size-10 items-center justify-center border-2 border-border bg-accent font-display font-bold text-accent-foreground"
                                        >
                                            {member.name.charAt(0)}
                                        </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-foreground">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatRole(member.role)} · {member.studentEmail}
                                        </p>
                                    </div>
                                    <Badge variant={member.verifiedAt ? "accent" : "destructive"}>
                                        {member.verifiedAt ? t.verified : t.unverified}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </PosterPanel>
            </section>

            <section aria-labelledby="member-cards-heading">
                <PosterPanel className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="flex items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center bg-accent text-accent-foreground">
                            <IdCard className="size-5" />
                        </span>
                        <div>
                            <h2
                                className="font-display text-xl font-bold tracking-tight text-foreground"
                                id="member-cards-heading"
                            >
                                {t.memberCards}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t.memberCardsHint}</p>
                        </div>
                    </div>
                    <Link className={buttonVariants({ variant: "outline" })} href="/team/cards">
                        {t.memberCards}
                        <ArrowUpRight className="size-4" />
                    </Link>
                </PosterPanel>
            </section>
        </div>
    );
}

function getActionContent(action: TeamOverviewActionId, t: ReturnType<typeof getMessages>["teamOverview"]) {
    switch (action) {
        case "VERIFY_MEMBERS":
            return { title: t.actionVerifyTitle, description: t.actionVerifyDescription, href: "/team/settings" };
        case "SUBMIT_PROJECT":
            return { title: t.actionSubmitTitle, description: t.actionSubmitDescription, href: "/team/submit" };
        case "SUBMIT_CLOSED":
            return {
                title: t.actionSubmitClosedTitle,
                description: t.actionSubmitClosedDescription,
                href: undefined,
            };
        case "READ_NOTIFICATIONS":
            return {
                title: t.actionReadTitle,
                description: t.actionReadDescription,
                href: "/team/notifications",
            };
        case "UP_TO_DATE":
            return { title: t.actionUpToDateTitle, description: t.actionUpToDateDescription, href: undefined };
    }
}
