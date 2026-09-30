import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="space-y-3">
                <Skeleton className="h-5 w-40 bg-orange-100" />
                <Skeleton className="h-10 w-72 max-w-full bg-zinc-100" />
                <Skeleton className="h-5 w-full max-w-2xl bg-zinc-100" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {(["one", "two", "three", "four", "five", "six"] as const).map((card) => (
                    <div
                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                        key={card}
                    >
                        <Skeleton className="aspect-video w-full bg-zinc-100" />
                        <Skeleton className="mt-4 h-3 w-24 bg-orange-100" />
                        <Skeleton className="mt-3 h-5 w-3/4 bg-zinc-100" />
                        <Skeleton className="mt-2 h-4 w-full bg-zinc-100" />
                    </div>
                ))}
            </div>
        </main>
    );
}
