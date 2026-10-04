import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
};

export function DashboardPageHeader({ eyebrow, title, description, actions }: DashboardPageHeaderProps) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">{eyebrow}</p>
                )}
                <h1
                    className={eyebrow ? "mt-2 text-3xl font-bold tracking-tight" : "text-3xl font-bold tracking-tight"}
                >
                    {title}
                </h1>
                {description && <p className="mt-2 text-muted-foreground">{description}</p>}
            </div>
            {actions}
        </header>
    );
}
