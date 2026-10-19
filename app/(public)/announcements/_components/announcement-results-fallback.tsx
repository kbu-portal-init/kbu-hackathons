export default function AnnouncementResultsFallback() {
    return (
        <div
            role="status"
            aria-label="Loading announcements"
            aria-busy="true"
            className="flex min-w-0 flex-col border-t-2 border-border"
        >
            {["first", "second", "third", "fourth"].map((item) => (
                <div
                    key={item}
                    className="grid animate-pulse gap-4 border-b-2 border-border/15 py-6 motion-reduce:animate-none sm:grid-cols-[7.5rem_1fr] lg:grid-cols-[8.5rem_7rem_1fr_auto] lg:gap-6 lg:px-2"
                >
                    <div className="h-3 w-24 bg-foreground/10" />
                    <div className="hidden aspect-4/3 w-full max-w-32 border-2 border-border/20 bg-secondary lg:block" />
                    <div>
                        <div className="h-6 w-3/4 bg-foreground/10" />
                        <div className="mt-3 h-4 w-full bg-foreground/10" />
                        <div className="mt-2 h-4 w-2/3 bg-foreground/10" />
                    </div>
                    <div className="h-6 w-20 bg-foreground/10" />
                </div>
            ))}
        </div>
    );
}
