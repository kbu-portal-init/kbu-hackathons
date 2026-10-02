import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getTeam } from "@/actions/management/teams";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { TeamActions } from "../_components/team-actions";
import { ReopenSubmissionButton } from "./_components/reopen-submission-button";

export default async function PanelTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    const result = await getTeam({ teamId });
    if (!result.ok) notFound();
    const team = result.data;
    return (
        <div className="space-y-6">
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
                                className="size-10 rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700"
                                aria-hidden="true"
                            >
                                {getInitials(team.displayName)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight">{team.displayName}</h1>
                            <p className="truncate text-sm text-muted-foreground">@{team.loginName}</p>
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
                    <p className="text-sm text-muted-foreground">{team.applicationNotes || "No application notes."}</p>
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
                                        className="size-10 rounded-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700"
                                        aria-hidden="true"
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{member.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{member.role}</Badge>
                                <Badge variant={member.verifiedAt ? "default" : "secondary"}>
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
                            <h3 className="font-semibold">{team.submission.title}</h3>
                            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                                {team.submission.summary || "No summary."}
                            </p>
                        </div>
                        <div className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
                            <Info label="Problem" value={team.submission.problem} />
                            <Info label="Target users" value={team.submission.targetUsers} />
                            <Info label="Solution" value={team.submission.solution} />
                            <Info label="Technology" value={team.submission.technologyStack} />
                            <Info label="Additional notes" value={team.submission.additionalNotes || "None"} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {team.submission.repositoryUrl && (
                                <a
                                    className="text-primary underline"
                                    href={team.submission.repositoryUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Repository
                                </a>
                            )}
                            {team.submission.demoUrl && (
                                <a
                                    className="text-primary underline"
                                    href={team.submission.demoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Demo
                                </a>
                            )}
                            {team.submission.presentationUrl && (
                                <a
                                    className="text-primary underline"
                                    href={team.submission.presentationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Presentation
                                </a>
                            )}
                            {team.submission.demoVideoUrl && (
                                <a
                                    className="text-primary underline"
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
                                <p className="text-sm text-muted-foreground">
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
                    <p className="text-sm text-muted-foreground">This team has not submitted a project yet.</p>
                )}
            </Panel>
            <Panel title="Review history">
                {team.reviews.length ? (
                    <div className="divide-y">
                        {team.reviews.map((review) => (
                            <div key={review.id} className="py-3 text-sm">
                                <div className="flex justify-between gap-2">
                                    <Badge variant="outline">{review.decision}</Badge>
                                    <span className="text-muted-foreground">
                                        {format(new Date(review.createdAt), "PPP p")}
                                    </span>
                                </div>
                                {review.reason && <p className="mt-1 text-muted-foreground">{review.reason}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No reviews recorded.</p>
                )}
            </Panel>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
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
