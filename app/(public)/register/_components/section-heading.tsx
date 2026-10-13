export function SectionHeading({ step, title, hint }: { step: number; title: string; hint?: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step}
            </span>
            <div>
                <h3 className="text-lg font-bold leading-7 tracking-tight text-foreground">{title}</h3>
                {hint ? <p className="text-sm leading-5 text-brand-muted-foreground">{hint}</p> : null}
            </div>
        </div>
    );
}
