import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
    return (
        <main className="space-y-8 p-6 lg:p-10">
            <div className="space-y-3">
                <Skeleton className="h-9 w-56 bg-orange-100" />
                <Skeleton className="h-5 w-full max-w-xl bg-zinc-100" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(["one", "two", "three", "four"] as const).map((card) => (
                    <article
                        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                        key={card}
                    >
                        <Skeleton className="aspect-1200/630 w-full rounded-none bg-orange-50" />
                        <div className="space-y-4 p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 bg-zinc-100" />
                                <Skeleton className="h-4 w-24 bg-zinc-100" />
                                <Skeleton className="h-4 w-full bg-zinc-100" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-20 bg-zinc-100" />
                                <Skeleton className="h-9 w-20 bg-orange-100" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
