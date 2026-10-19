import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getTeam } from "@/actions/management/teams";
import { BackButton } from "@/components/back-button";
import { DashboardDetailSkeleton } from "@/components/dashboard-skeletons";
import { Badge } from "@/components/ui/badge";
import { formatRole } from "@/lib/util";
import { TeamActions } from "../_components/team-actions";
import { ReopenSubmissionButton } from "./_components/reopen-submission-button";

export default function PanelTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
    return (
        <main className="space-y-8">
            <Suspense fallback={<DashboardDetailSkeleton />}>
                {params.then(({ teamId }) => (
                    <TeamDetailContent teamId={teamId} />
                ))}
            </Suspense>
        </main>
    );
}

async function TeamDetailContent({ teamId }: { teamId: string }) {
    const result = await getTeam({ teamId });
    if (!result.ok) notFound();
    const team = result.data;
    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-4">
                    <BackButton fallbackHref="/panel/teams" />
                    <div className="flex items-center gap-3">
                        {team.imageUrl ? (
                            <Image
                                src={team.imageUrl}
                                alt={`${team.displayName} avatar`}
                                width={40}
                                height={40}
                                className="size-10 rounded-none object-cover"
                                unoptimized
                            />
                        ) : (
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-none bg-brand-yellow font-display text-sm font-bold text-brand-ink"
                                aria-hidden="true"
                            >
                                {getInitials(team.displayName)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="truncate font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em] text-brand-ink">
                                {team.displayName}
                            </h1>
                            <p className="truncate text-sm text-brand-muted-foreground">@{team.loginName}</p>
                        </div>
                    </div>
                </div>
                <TeamActions team={team} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Team information">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <Info label="Registration" value={team.registrationStatus} />
                        <Info label="Account" value={team.banned ? "Banned" : "Active"} />
                        <Info label="Program" value={formatRole(team.program)} />
                        <Info label="Created" value={format(new Date(team.createdAt), "PPP p")} />
                        <Info label="Updated" value={format(new Date(team.updatedAt), "PPP p")} />
                        <Info
                            label="Submitted"
                            value={team.submittedAt ? format(new Date(team.submittedAt), "PPP p") : "Not submitted"}
                        />
                        <Info label="Members" value={String(team.memberCount)} />
                    </div>
                </Panel>
                <Panel title="Registration notes">
                    <p className="text-sm text-brand-muted-foreground">
                        {team.applicationNotes || "No application notes."}
                    </p>
                </Panel>
            </div>
            <Panel title={`Roster (${team.members.length})`}>
                <div className="divide-y">
                    {team.members.map((member) => (
                        <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                                {member.imageUrl ? (
                                    <Image
                                        src={member.imageUrl}
                                        alt={`${member.name} avatar`}
                                        width={40}
                                        height={40}
                                        className="size-10 rounded-none object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="flex size-10 shrink-0 items-center justify-center rounded-none bg-brand-yellow font-display font-bold text-brand-ink"
                                        aria-hidden="true"
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{member.name}</p>
                                    <p className="truncate text-sm text-brand-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-none border-2 border-brand-ink/20 text-brand-ink"
                                >
                                    {member.role}
                                </Badge>
                                <Badge
                                    variant={member.verifiedAt ? "default" : "secondary"}
                                    className="rounded-none border-2 border-brand-ink/20"
                                >
                                    {member.verifiedAt ? "Verified" : "Unverified"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>
            <Panel title="Submission">
                {team.submission ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-display text-lg font-bold text-brand-ink">{team.submission.title}</h3>
                            <p className="mt-1 whitespace-pre-wrap text-brand-muted-foreground">
                                {team.submission.summary || "No summary."}
                            </p>
                        </div>
                        <div className="grid gap-4 border-t-2 border-brand-ink/15 pt-4 text-sm sm:grid-cols-2">
                            <Info label="Problem" value={team.submission.problem} />
                            <Info label="Target users" value={team.submission.targetUsers} />
                            <Info label="Solution" value={team.submission.solution} />
                            <Info label="Technology" value={team.submission.technologyStack} />
                            <Info label="Additional notes" value={team.submission.additionalNotes || "None"} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {team.submission.repositoryUrl && (
                                <a
                                    className="font-semibold text-brand-ink underline decoration-primary decoration-2 underline-offset-4"
                                    href={team.submission.repositoryUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Repository
                                </a>
                            )}
                            {team.submission.demoUrl && (
                                <a
                                    className="font-semibold text-brand-ink underline decoration-primary decoration-2 underline-offset-4"
                                    href={team.submission.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Demo
                                </a>
                            )}
                            {team.submission.presentationUrl && (
                                <a
                                    className="font-semibold text-brand-ink underline decoration-primary decoration-2 underline-offset-4"
                                    href={team.submission.presentationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Presentation
                                </a>
                            )}
                            {team.submission.demoVideoUrl && (
                                <a
                                    className="font-semibold text-brand-ink underline decoration-primary decoration-2 underline-offset-4"
                                    href={team.submission.demoVideoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Demo video
                                </a>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge
                                    variant={
                                        team.submission.status === "SUBMITTED"
                                            ? "default"
                                            : team.submission.status === "REOPENED"
                                              ? "outline"
                                              : "secondary"
                                    }
                                >
                                    {team.submission.status === "SUBMITTED"
                                        ? "Final submission"
                                        : team.submission.status === "REOPENED"
                                          ? "Reopened for editing"
                                          : "Draft"}
                                </Badge>
                                <p className="text-sm text-brand-muted-foreground">
                                    {team.submission.status === "SUBMITTED" && team.submission.submittedAt
                                        ? `Submitted ${format(new Date(team.submission.submittedAt), "PPP p")}`
                                        : "Not finalized"}
                                </p>
                            </div>
                            {team.submission.status === "SUBMITTED" && (
                                <ReopenSubmissionButton submissionId={team.submission.id} />
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-brand-muted-foreground">This team has not submitted a project yet.</p>
                )}
            </Panel>
            <Panel title="Review history">
                {team.reviews.length ? (
                    <div className="divide-y">
                        {team.reviews.map((review) => (
                            <div key={review.id} className="py-3 text-sm">
                                <div className="flex justify-between gap-2">
                                    <Badge variant="outline">{review.decision}</Badge>
                                    <span className="text-brand-muted-foreground">
                                        {format(new Date(review.createdAt), "PPP p")}
                                    </span>
                                </div>
                                {review.reason && <p className="mt-1 text-brand-muted-foreground">{review.reason}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-brand-muted-foreground">No reviews recorded.</p>
                )}
            </Panel>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 font-medium text-brand-ink">{value}</dd>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-none border-2 border-brand-ink bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-brand-ink">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
