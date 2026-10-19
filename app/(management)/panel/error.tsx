"use client";

import { Button } from "@/components/ui/button";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="flex min-h-[60vh] flex-1 items-center justify-center">
            <section className="max-w-md space-y-4 border-2 border-brand-ink bg-card p-8 text-center">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted-foreground">
                    Management workspace
                </p>
                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-brand-ink">
                    Something went wrong
                </h1>
                <p className="text-brand-muted-foreground">We could not load this workspace. Please try again.</p>
                <Button
                    onClick={reset}
                    className="rounded-none border-2 border-brand-ink bg-brand-ink font-display text-sm font-semibold text-brand-paper hover:bg-brand-yellow hover:text-brand-ink"
                >
                    Try again
                </Button>
            </section>
        </main>
    );
}
