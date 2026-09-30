export default function PublicLoading() {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8">
            <div
                className="w-full max-w-md rounded-2xl border border-orange-200/80 bg-white p-6 shadow-xl shadow-orange-500/10 sm:p-8"
                role="status"
                aria-live="polite"
            >
                <div className="flex items-center gap-2 border-b border-orange-100 pb-4">
                    <span className="size-3 rounded-full bg-rose-300" aria-hidden />
                    <span className="size-3 rounded-full bg-amber-300" aria-hidden />
                    <span className="size-3 rounded-full bg-emerald-300" aria-hidden />
                    <span className="ml-2 font-mono text-xs text-muted-foreground">kbu-hackathon-2026</span>
                </div>

                <div className="pt-6">
                    <p className="font-mono text-sm font-medium text-orange-600">
                        <span aria-hidden>$ </span>kbu-hackathon --loading
                        <span
                            className="ml-1 inline-block h-4 w-2 animate-pulse bg-orange-600 motion-reduce:animate-none"
                            aria-hidden
                        />
                    </p>
                    <p className="mt-4 text-lg font-semibold text-zinc-950">Preparing your workspace</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Loading the latest hackathon updates and resources.
                    </p>
                </div>
            </div>
        </main>
    );
}
