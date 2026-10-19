export function SectionHeading({ step, title, hint }: { step: number; title: string; hint?: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center border-2 border-brand-ink bg-brand-yellow font-display text-sm font-bold text-brand-ink">
                {String(step).padStart(2, "0")}
            </span>
            <div>
                <h3 className="font-display text-lg font-bold leading-7 tracking-[-0.02em] text-brand-ink">{title}</h3>
                {hint ? <p className="text-sm leading-6 text-brand-muted-foreground">{hint}</p> : null}
            </div>
        </div>
    );
}
