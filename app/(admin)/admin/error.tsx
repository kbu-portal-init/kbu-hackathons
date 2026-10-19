"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="flex min-h-[60vh] flex-1 items-center justify-center">
            <section className="max-w-md space-y-4 border-2 border-border bg-card p-8 text-center">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Administrator
                </p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">We could not load this workspace. Please try again.</p>
                <Button
                    onClick={reset}
                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                >
                    Try again
                </Button>
            </section>
        </main>
    );
}
