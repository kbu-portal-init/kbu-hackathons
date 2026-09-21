import { Skeleton } from "@/components/ui/skeleton";

export default function PanelLoading() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <Skeleton className="h-9 w-56 bg-orange-100" />
                <Skeleton className="h-5 w-full max-w-xl bg-zinc-100" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(["one", "two", "three", "four"] as const).map((card) => (
                    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" key={card}>
                        <Skeleton className="h-4 w-24 bg-zinc-100" />
                        <Skeleton className="h-8 w-20 bg-orange-100" />
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <Skeleton className="h-6 w-40 bg-zinc-100" />
                <div className="mt-6 space-y-4">
                    {(["one", "two", "three", "four", "five"] as const).map((row) => (
                        <Skeleton className="h-12 w-full bg-zinc-100" key={row} />
                    ))}
                </div>
            </div>
        </div>
    );
}
