import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getTeam } from "@/actions/management/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamActions } from "../_components/team-actions";

export default async function PanelTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    const result = await getTeam({ teamId });
    if (!result.ok) notFound();
    const team = result.data;
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Button variant="ghost" size="sm" render={<Link href="/panel/teams" />}>
                        ← All teams
                    </Button>
                    <p className="mt-4 text-sm font-medium text-zinc-500">Team detail</p>
                    <h1 className="text-2xl font-semibold tracking-tight">{team.displayName}</h1>
                    <p className="mt-1 text-sm text-zinc-500">@{team.loginName}</p>
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
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
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
                                        className="size-10 rounded-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                        aria-hidden="true"
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{member.name}</p>
                                    <p className="truncate text-sm text-zinc-500">{member.email}</p>
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
                            <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                                {team.submission.description || "No description."}
                            </p>
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
                        </div>
                        <p className="text-zinc-500">
                            {team.submission.submittedAt
                                ? `Submitted ${format(new Date(team.submission.submittedAt), "PPP p")}`
                                : "Draft submission"}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500">This team has not submitted a project yet.</p>
                )}
            </Panel>
            <Panel title="Review history">
                {team.reviews.length ? (
                    <div className="divide-y">
                        {team.reviews.map((review) => (
                            <div key={review.id} className="py-3 text-sm">
                                <div className="flex justify-between gap-2">
                                    <Badge variant="outline">{review.decision}</Badge>
                                    <span className="text-zinc-500">{format(new Date(review.createdAt), "PPP p")}</span>
                                </div>
                                {review.reason && (
                                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">{review.reason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500">No reviews recorded.</p>
                )}
            </Panel>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-zinc-500">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
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
