import { Skeleton } from "@/components/ui/skeleton";

type SkeletonProps = { header?: boolean };

function HeadingBars() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-4 w-40 rounded-none bg-brand-ink/10" />
            <Skeleton className="h-8 w-64 max-w-full rounded-none bg-primary/20" />
            <Skeleton className="h-4 w-96 max-w-full rounded-none bg-brand-ink/10" />
        </div>
    );
}

function StatusRegion({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div role="status" aria-label={label}>
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}

export function DashboardListSkeleton({ header = false }: SkeletonProps) {
    return (
        <StatusRegion label="Loading list">
            <div className="space-y-6">
                {header ? <HeadingBars /> : null}
                <div className="flex flex-wrap gap-2">
                    {["one", "two", "three", "four"].map((key) => (
                        <Skeleton className="h-9 w-24 rounded-none bg-brand-ink/10" key={key} />
                    ))}
                </div>
                <div className="border-2 border-brand-ink bg-card p-6">
                    <Skeleton className="h-6 w-44 rounded-none bg-brand-ink/10" />
                    <div className="mt-6 space-y-4">
                        {["one", "two", "three", "four", "five"].map((key) => (
                            <Skeleton className="h-12 w-full rounded-none bg-brand-ink/10" key={key} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-9 w-56 rounded-none bg-brand-ink/10" />
                </div>
            </div>
        </StatusRegion>
    );
}

export function DashboardFormSkeleton({ header = false }: SkeletonProps) {
    return (
        <StatusRegion label="Loading form">
            <div className="space-y-6">
                {header ? <HeadingBars /> : null}
                <div className="space-y-8 border-2 border-brand-ink bg-card p-6">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-40 rounded-none bg-primary/20" />
                        <Skeleton className="h-4 w-72 max-w-full rounded-none bg-brand-ink/10" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {["one", "two", "three", "four"].map((key) => (
                            <div className="space-y-2" key={key}>
                                <Skeleton className="h-4 w-24 rounded-none bg-brand-ink/10" />
                                <Skeleton className="h-10 w-full rounded-none bg-brand-ink/10" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 rounded-none bg-brand-ink/10" />
                        <Skeleton className="h-24 w-full rounded-none bg-brand-ink/10" />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Skeleton className="h-10 w-28 rounded-none bg-primary/20" />
                </div>
            </div>
        </StatusRegion>
    );
}

export function DashboardDetailSkeleton() {
    return (
        <StatusRegion label="Loading details">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24 rounded-none bg-brand-ink/10" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-56 max-w-full rounded-none bg-primary/20" />
                        <Skeleton className="h-4 w-32 rounded-none bg-brand-ink/10" />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {["one", "two", "three", "four", "five", "six"].map((key) => (
                        <div className="space-y-2" key={key}>
                            <Skeleton className="h-3 w-20 rounded-none bg-brand-ink/10" />
                            <Skeleton className="h-5 w-28 max-w-full rounded-none bg-brand-ink/10" />
                        </div>
                    ))}
                </div>
                <div className="border-2 border-brand-ink bg-card p-6">
                    <Skeleton className="h-5 w-40 rounded-none bg-brand-ink/10" />
                    <div className="mt-4 space-y-3">
                        {["one", "two", "three", "four", "five"].map((key) => (
                            <Skeleton className="h-10 w-full rounded-none bg-brand-ink/10" key={key} />
                        ))}
                    </div>
                </div>
                <div className="border-2 border-brand-ink bg-card p-6">
                    <Skeleton className="h-5 w-36 rounded-none bg-brand-ink/10" />
                    <div className="mt-4 space-y-3">
                        {["one", "two"].map((key) => (
                            <Skeleton className="h-10 w-full rounded-none bg-brand-ink/10" key={key} />
                        ))}
                    </div>
                </div>
            </div>
        </StatusRegion>
    );
}

export function DashboardCardGridSkeleton() {
    return (
        <StatusRegion label="Loading member cards">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {["one", "two", "three", "four"].map((key) => (
                    <article className="overflow-hidden border-2 border-brand-ink bg-card" key={key}>
                        <Skeleton className="aspect-1200/630 w-full rounded-none bg-primary/15" />
                        <div className="space-y-4 p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 rounded-none bg-brand-ink/10" />
                                <Skeleton className="h-4 w-24 rounded-none bg-brand-ink/10" />
                            </div>
                            <Skeleton className="h-4 w-full rounded-none bg-brand-ink/10" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-20 rounded-none bg-brand-ink/10" />
                                <Skeleton className="h-9 w-20 rounded-none bg-primary/20" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </StatusRegion>
    );
}

export function DashboardStatGridSkeleton({
    count = 12,
    className = "sm:grid-cols-2 lg:grid-cols-4",
}: {
    count?: number;
    className?: string;
}) {
    return (
        <StatusRegion label="Loading overview">
            <div className={`grid gap-4 ${className}`}>
                {Array.from({ length: count }, (_, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid
                    <div className="space-y-3 border-2 border-brand-ink bg-card p-5" key={index}>
                        <Skeleton className="h-4 w-24 rounded-none bg-brand-ink/10" />
                        <Skeleton className="h-8 w-20 rounded-none bg-primary/20" />
                    </div>
                ))}
            </div>
        </StatusRegion>
    );
}
