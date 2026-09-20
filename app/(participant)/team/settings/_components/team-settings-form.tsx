"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { updateMemberImage } from "@/actions/participant/team-members";
import { updateTeamLogo } from "@/actions/participant/team-settings";
import { FileUpload } from "@/components/file-upload";
import type { TeamMemberCard } from "@/lib/contracts/team-members";
import { formatRole } from "@/lib/util";

type TeamSettingsFormProps = {
    team: { displayName: string; imageUrl: string | null };
    members: TeamMemberCard[];
};

export function TeamSettingsForm({ team, members }: TeamSettingsFormProps) {
    const [teamImageUrl, setTeamImageUrl] = useState(team.imageUrl);
    const [memberImages, setMemberImages] = useState(() =>
        Object.fromEntries(members.map((member) => [member.id, member.imageUrl])),
    );

    async function saveTeamLogo(imageUrl: string | null) {
        const result = await updateTeamLogo({ imageUrl });
        if (!result.ok) return toast.error(result.error.message);
        setTeamImageUrl(result.data.imageUrl);
        toast.success("Team profile updated");
    }

    async function saveMemberImage(memberId: string, imageUrl: string | null) {
        const result = await updateMemberImage({ memberId, imageUrl });
        if (!result.ok) return toast.error(result.error.message);
        setMemberImages((current) => ({ ...current, [memberId]: result.data.imageUrl }));
        toast.success("Member profile updated");
    }

    return (
        <div className="space-y-8">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-zinc-950">Team logo</h2>
                    <p className="mt-1 text-sm text-zinc-600">Upload the logo shown for {team.displayName}.</p>
                </div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-3xl font-bold text-orange-700">
                        {teamImageUrl ? (
                            <Image
                                alt={`${team.displayName} logo`}
                                className="size-full object-cover"
                                height={112}
                                src={teamImageUrl}
                                unoptimized
                                width={112}
                            />
                        ) : (
                            team.displayName.charAt(0)
                        )}
                    </div>
                    <FileUpload
                        accept="image/png,image/jpeg,image/webp"
                        category="image"
                        currentFile={teamImageUrl}
                        inputId="team-profile-image"
                        label="Choose team logo"
                        onRemove={() => void saveTeamLogo(null)}
                        onUploadComplete={(url) => void saveTeamLogo(url)}
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-zinc-950">Member profiles</h2>
                    <p className="mt-1 text-sm text-zinc-600">Upload a profile image for each team member.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    {members.map((member) => (
                        <article className="flex gap-4 rounded-xl border border-zinc-200 p-4" key={member.id}>
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-100 text-xl font-bold text-orange-700">
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
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <h3 className="font-semibold text-zinc-950">{member.name}</h3>
                                <p className="text-sm text-zinc-700">{formatRole(member.role)}</p>
                                <p className="break-all text-sm text-zinc-700">{member.studentEmail}</p>
                                <FileUpload
                                    accept="image/png,image/jpeg,image/webp"
                                    category="member-profile-image"
                                    currentFile={memberImages[member.id]}
                                    inputId={`member-profile-image-${member.id}`}
                                    label="Choose image"
                                    onRemove={() => void saveMemberImage(member.id, null)}
                                    onUploadComplete={(url) => void saveMemberImage(member.id, url)}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
