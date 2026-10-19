export function SectionHeading({ step, title, hint }: { step: number; title: string; hint?: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-accent font-display text-sm font-bold text-accent-foreground">
                {String(step).padStart(2, "0")}
            </span>
            <div>
                <h3 className="font-display text-lg font-bold leading-7 tracking-tight text-foreground">{title}</h3>
                {hint ? <p className="text-sm leading-6 text-muted-foreground">{hint}</p> : null}
            </div>
        </div>
    );
}
