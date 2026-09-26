"use client";

import { Download, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateMemberCard } from "@/actions/participant/member-cards";
import { CardImageViewer } from "@/components/card-image-viewer";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import type { TeamMemberCard } from "@/lib/contracts/team-members";
import { formatRole } from "@/lib/util";

export function MemberCards({ members }: { members: TeamMemberCard[] }) {
    const [items, setItems] = useState(members);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate(memberId: string) {
        setBusyId(memberId);
        setError(null);
        const result = await generateMemberCard({ memberId });
        if (result.ok) {
            setItems((current) =>
                current.map((member) =>
                    member.id === result.data.id
                        ? {
                              ...member,
                              cardUrl: result.data.cardUrl,
                              cardShareToken: result.data.cardShareToken,
                          }
                        : member,
                ),
            );
        } else {
            setError(result.error.message);
        }
        setBusyId(null);
    }

    function getShareUrl(member: TeamMemberCard) {
        return `${window.location.origin}/cards/${member.cardShareToken}`;
    }

    async function handleDownload(member: TeamMemberCard) {
        try {
            const response = await fetch(`/api/participant/member-card/${member.id}/download`);
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `${
                member.name
                    .replace(/[^a-z0-9]+/gi, "-")
                    .replace(/^-|-$/g, "")
                    .toLowerCase() || "member"
            }-card.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
            toast.success("Card download started");
        } catch {
            toast.error("Unable to download card");
        }
    }

    if (items.length === 0) return <p className="text-sm text-zinc-500">No team members are available yet.</p>;

    return (
        <div className="space-y-4">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((member) => (
                    <article
                        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                        key={member.id}
                    >
                        {busyId === member.id ? (
                            <div className="flex aspect-1200/630 items-center justify-center bg-orange-50 text-sm text-orange-900">
                                Generating new card...
                            </div>
                        ) : member.cardUrl ? (
                            <CardImageViewer
                                alt={`${member.name} digital card`}
                                className="aspect-1200/630 w-full object-cover"
                                src={member.cardUrl}
                            />
                        ) : (
                            <div className="flex aspect-1200/630 items-center justify-center bg-orange-50 text-sm text-orange-900">
                                Card not generated
                            </div>
                        )}
                        <div className="space-y-4 p-4">
                            <div className="min-w-0">
                                <h2 className="font-semibold">{member.name}</h2>
                                <p className="text-sm text-muted-foreground">{formatRole(member.role)}</p>
                                <p className="mt-1 break-all text-sm text-muted-foreground">{member.studentEmail}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {member.cardUrl ? (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="cursor-pointer transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => handleDownload(member)}
                                    >
                                        <Download />
                                        Download
                                    </Button>
                                ) : null}
                                {member.cardUrl && member.cardShareToken ? (
                                    <ShareButton
                                        title="KBU Hackathon 2026 participant card"
                                        url={getShareUrl(member)}
                                        className="h-auto rounded-md border-zinc-300 text-sm font-normal text-zinc-900"
                                    />
                                ) : null}
                                <Button
                                    size="lg"
                                    className="cursor-pointer hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={busyId === member.id}
                                    onClick={() => handleGenerate(member.id)}
                                >
                                    <Sparkles />
                                    {busyId === member.id
                                        ? "Generating..."
                                        : member.cardUrl
                                          ? "Regenerate"
                                          : "Generate"}
                                </Button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
