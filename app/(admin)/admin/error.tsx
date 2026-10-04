"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="flex min-h-[60vh] flex-1 items-center justify-center">
            <section className="max-w-md space-y-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Administrator</p>
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-muted-foreground">We could not load this workspace. Please try again.</p>
                <Button onClick={reset}>Try again</Button>
            </section>
        </main>
    );
}
