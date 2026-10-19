import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
};

export function DashboardPageHeader({ eyebrow, title, description, actions }: DashboardPageHeaderProps) {
    return (
        <header className="flex flex-col gap-4 border-b-2 border-border/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {eyebrow}
                    </p>
                )}
                <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                    {title}
                </h1>
                {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
            </div>
            {actions}
        </header>
    );
}
