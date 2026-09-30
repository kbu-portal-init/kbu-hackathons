import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-16 sm:py-24">
            <section className="w-full max-w-xl text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">KBU Hackathon 2026</p>

                <h1 className="mt-5 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">Page not found</h1>

                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
                    The page you are looking for may have moved, been removed, or never existed.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Go home
                    </Link>
                </div>
            </section>
        </main>
    );
}
