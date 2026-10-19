"use client";

import { PosterButton } from "@/components/poster";

export default function TeamError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="flex flex-1 items-center justify-center p-8">
            <section className="max-w-md space-y-4 border-2 border-border bg-card p-8 text-center">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Participant workspace
                </p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">We could not load this workspace. Please try again.</p>
                <PosterButton
                    tone="solid"
                    onClick={reset}
                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                >
                    Try again
                </PosterButton>
            </section>
        </main>
    );
}
