import { Suspense } from "react";
import { CardImageViewer } from "@/components/card-image-viewer";
import { ShareButton } from "@/components/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicMemberCard } from "@/lib/data/public-member-cards";

type PublicCardPageProps = { params: Promise<{ token: string }> };

export default function PublicMemberCardPage({ params }: PublicCardPageProps) {
    return (
        <Suspense fallback={<MemberCardFallback />}>
            {params.then(({ token }) => (
                <MemberCard token={token} />
            ))}
        </Suspense>
    );
}

async function MemberCard({ token }: { token: string }) {
    const cardUrl = await getPublicMemberCard(token);

    if (!cardUrl) {
        return (
            <main className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8">
                <section className="w-full max-w-lg border-2 border-border bg-card p-8 text-center sm:p-10">
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        KBU Hackathon 2026
                    </p>
                    <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">
                        Participant Card not found
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        This card link may be invalid, expired, or no longer available.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8">
            <section className="w-full max-w-3xl">
                <div className="relative">
                    <div
                        className="absolute inset-0 translate-x-2 translate-y-2 border-2 border-border bg-foreground"
                        aria-hidden="true"
                    />
                    <div className="relative border-2 border-border bg-background p-2">
                        <CardImageViewer alt="KBU Hackathon participant card" className="h-auto w-full" src={cardUrl} />
                    </div>
                </div>
                <div className="mt-6 flex justify-center border-2 border-border bg-accent text-accent-foreground p-4">
                    <ShareButton title="KBU Hackathon participant card" />
                </div>
            </section>
        </main>
    );
}

function MemberCardFallback() {
    return (
        <main
            className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8"
            role="status"
            aria-label="Loading participant card"
        >
            <span className="sr-only">Loading participant card</span>
            <section className="w-full max-w-3xl">
                <div className="border-2 border-border/15 bg-background p-2">
                    <Skeleton className="aspect-video w-full bg-foreground/10" />
                </div>
                <div className="mt-6 border-2 border-border/15 bg-accent text-accent-foreground p-4">
                    <Skeleton className="mx-auto h-9 w-28 bg-foreground/20" />
                </div>
            </section>
        </main>
    );
}
