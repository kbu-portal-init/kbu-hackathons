"use client";

import { CalendarDays, CheckCircle2, KeyRound, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { updateMemberImage } from "@/actions/participant/team-members";
import { updateTeamLogo } from "@/actions/participant/team-settings";
import { FileUpload } from "@/components/file-upload";
import { PosterBadge, PosterPanel } from "@/components/poster";
import type { TeamMemberCard } from "@/lib/contracts/team-members";
import { formatRole } from "@/lib/util";

type TeamSettingsFormProps = {
    team: { displayName: string; imageUrl: string | null; loginName: string; approvalDate: string | null };
    members: TeamMemberCard[];
};

export function TeamSettingsForm({ team, members }: TeamSettingsFormProps) {
    const [teamImageUrl, setTeamImageUrl] = useState(team.imageUrl);
    const [memberImages, setMemberImages] = useState(() =>
        Object.fromEntries(members.map((member) => [member.id, member.imageUrl])),
    );

    async function saveTeamLogo(imageUrl: string | null) {
        const result = await updateTeamLogo({ imageUrl });
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        setTeamImageUrl(result.data.imageUrl);
        toast.success("Team profile updated");
    }

    async function saveMemberImage(memberId: string, imageUrl: string | null) {
        const result = await updateMemberImage({ memberId, imageUrl });
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        setMemberImages((current) => ({ ...current, [memberId]: result.data.imageUrl }));
        toast.success("Member profile updated");
    }

    return (
        <div className="space-y-8">
            <PosterPanel className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden bg-accent font-display text-2xl font-bold text-accent-foreground">
                            {teamImageUrl ? (
                                <Image
                                    alt={`${team.displayName} logo`}
                                    className="size-full object-cover"
                                    height={64}
                                    src={teamImageUrl}
                                    unoptimized
                                    width={64}
                                />
                            ) : (
                                team.displayName.charAt(0)
                            )}
                            <FileUpload
                                accept="image/png,image/jpeg,image/webp"
                                category="image"
                                currentFile={teamImageUrl}
                                iconOverlay
                                inputId="team-profile-image"
                                label="Change team logo"
                                onRemove={() => void saveTeamLogo(null)}
                                onUploadComplete={(url) => saveTeamLogo(url)}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-muted-foreground">Team profile</p>
                            <h2 className="truncate font-display text-2xl font-bold tracking-tight text-foreground">
                                {team.displayName}
                            </h2>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <PosterBadge
                                    tone="accent"
                                    className="border-2 border-border bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <CheckCircle2 /> Approved
                                </PosterBadge>
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Users className="size-4" />
                                    {members.length} {members.length === 1 ? "member" : "members"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-3 text-sm sm:min-w-56">
                        <div className="flex items-start gap-2">
                            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                                <p className="font-medium text-foreground">Team username</p>
                                <p className="break-all text-muted-foreground">{team.loginName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div>
                                <p className="font-medium text-foreground">Approved</p>
                                <p className="text-muted-foreground">
                                    {team.approvalDate
                                        ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                              new Date(team.approvalDate),
                                          )
                                        : "Approval date unavailable"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="mt-5 border-t-2 border-border/15 pt-4 text-sm text-muted-foreground">
                    This shared username is used by your team to sign in to the workspace. Keep it and the team password
                    available to approved members only.
                </p>
            </PosterPanel>

            <PosterPanel className="p-6">
                <div className="mb-5">
                    <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Member profiles</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Keep your roster recognizable by adding a profile image for each member. Names, roles, and
                        student emails are managed from registration.
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    {members.map((member, index) => (
                        <article className="flex min-w-0 gap-4 border-2 border-border p-4" key={member.id}>
                            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden bg-accent font-display text-xl font-bold text-accent-foreground">
                                {memberImages[member.id] ? (
                                    <Image
                                        alt={`${member.name} profile`}
                                        className="size-full object-cover"
                                        height={80}
                                        src={memberImages[member.id] as string}
                                        unoptimized
                                        width={80}
                                    />
                                ) : (
                                    member.name.charAt(0)
                                )}
                                <FileUpload
                                    accept="image/png,image/jpeg,image/webp"
                                    category="member-profile-image"
                                    currentFile={memberImages[member.id]}
                                    iconOverlay
                                    inputId={`member-profile-image-${member.id}`}
                                    label="Choose image"
                                    onRemove={() => void saveMemberImage(member.id, null)}
                                    onUploadComplete={(url) => saveMemberImage(member.id, url)}
                                />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Member {index + 1}
                                        </p>
                                        <h3 className="truncate font-display font-bold text-foreground">
                                            {member.name}
                                        </h3>
                                    </div>
                                    <PosterBadge tone="neutral" className="border-2 border-border/20 text-foreground">
                                        {formatRole(member.role)}
                                    </PosterBadge>
                                </div>
                                <p className="break-all text-sm text-muted-foreground">{member.studentEmail}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </PosterPanel>
        </div>
    );
}
