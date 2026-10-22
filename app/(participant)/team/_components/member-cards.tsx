"use client";

import { Download, LoaderCircle, Sparkles } from "lucide-react";
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
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
        // biome-ignore lint/style/noNonNullAssertion: <We know this is set because we validated it>
        const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
        return `${appUrl}/cards/${member.cardShareToken}`;
    }

    async function handleDownload(member: TeamMemberCard) {
        setDownloadingId(member.id);
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
        } catch {
            toast.error("Unable to download card");
        } finally {
            setDownloadingId(null);
        }
    }

    if (items.length === 0) return <p className="text-sm text-muted-foreground">No team members are available yet.</p>;

    return (
        <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((member) => (
                    <article
                        className="flex h-full flex-col overflow-hidden border-2 border-border bg-card"
                        key={member.id}
                    >
                        {busyId === member.id ? (
                            <div className="flex aspect-1600/960 items-center justify-center bg-secondary text-secondary-foreground">
                                Generating new card...
                            </div>
                        ) : member.cardUrl ? (
                            <CardImageViewer
                                alt={`${member.name} digital card`}
                                className="aspect-1600/960 w-full object-cover"
                                src={member.cardUrl}
                            />
                        ) : (
                            <div className="flex aspect-1600/960 items-center justify-center bg-secondary text-secondary-foreground">
                                Card not generated
                            </div>
                        )}
                        <div className="flex flex-1 flex-col space-y-4 p-4">
                            <div className="min-w-0">
                                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                                    {member.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">{formatRole(member.role)}</p>
                                <p className="mt-1 break-all text-sm text-muted-foreground">{member.studentEmail}</p>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-2">
                                {member.cardUrl ? (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-2 border-border font-display text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                                        disabled={downloadingId === member.id}
                                        onClick={() => handleDownload(member)}
                                    >
                                        {downloadingId === member.id ? (
                                            <LoaderCircle className="animate-spin" />
                                        ) : (
                                            <Download />
                                        )}
                                        {downloadingId === member.id ? "Preparing…" : "Download"}
                                    </Button>
                                ) : null}
                                {member.cardUrl && member.cardShareToken ? (
                                    <ShareButton
                                        title="KBU Hackathon 2026 participant card"
                                        url={getShareUrl(member)}
                                        className="border-2 border-border/20 text-sm font-semibold text-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                                    />
                                ) : null}
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
