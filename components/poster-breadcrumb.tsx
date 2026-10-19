import { cn } from "cn";
import { ChevronRight, House } from "lucide-react";
import Link from "next/link";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export function PosterBreadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-1.5", className)}>
            <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
                {items.map((item, index) => {
                    const isCurrent = index === items.length - 1;

                    return (
                        <li key={item.href ?? item.label} className="flex min-w-0 items-center gap-1.5">
                            {index > 0 ? (
                                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-foreground/35" />
                            ) : null}
                            {item.href && !isCurrent ? (
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    {index === 0 ? <House aria-hidden="true" className="size-3.5 shrink-0" /> : null}
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    aria-current={isCurrent ? "page" : undefined}
                                    className="truncate font-display text-xs font-semibold text-foreground"
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
