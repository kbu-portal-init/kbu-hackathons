import Link from "next/link";
import { PosterPanel } from "@/components/poster-panel";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-5 py-16 sm:px-8 sm:py-24">
            <PosterPanel className="w-full max-w-xl p-6 text-center sm:p-10">
                <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    KBU Hackathon 2026
                </p>

                <p className="mt-6 font-display text-[clamp(5rem,20vw,9rem)] font-bold leading-[0.8] tracking-tighter text-primary">
                    404
                </p>

                <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Page not found
                </h1>

                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
                    The page you are looking for may have moved, been removed, or never existed.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/" className={buttonVariants()}>
                        Go home
                    </Link>
                </div>
            </PosterPanel>
        </main>
    );
}
