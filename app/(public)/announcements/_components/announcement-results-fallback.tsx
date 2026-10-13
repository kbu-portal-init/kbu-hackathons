export default function AnnouncementResultsFallback() {
    return (
        <div role="status" aria-label="Loading announcements" aria-busy="true" className="flex min-w-0 flex-col gap-3">
            {["first", "second", "third", "fourth"].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 h-4 w-24 rounded bg-muted" />
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}
