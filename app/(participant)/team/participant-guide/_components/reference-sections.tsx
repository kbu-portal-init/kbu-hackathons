import { ArrowUpRight, BookOpen, ClipboardCheck, FileText, Trophy } from "lucide-react";
import Link from "next/link";
import { PosterPanel } from "@/components/poster-panel";
import { buttonVariants } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n/messages";

export function ReferenceSections({ t }: { t: Messages["references"] }) {
    return (
        <section aria-labelledby="guide-title" className="scroll-mt-24" id="guide">
            <header className="max-w-2xl">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground" id="guide-title">
                    {t.guide.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.guide.description}</p>
            </header>

            <PosterPanel className="mt-5 divide-y-2 divide-border/15">
                <article className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center bg-accent text-accent-foreground">
                            <BookOpen className="size-5" />
                        </span>
                        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {t.guide.challenge.title}
                        </h3>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">{t.guide.challenge.lead}</p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t.guide.challenge.body}</p>
                    <p className="mt-5 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.guide.challenge.outcomeLabel}
                    </p>
                    <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        {t.guide.challenge.outcomes.map((outcome) => (
                            <li className="flex gap-2 text-foreground" key={outcome}>
                                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-primary" />
                                <span>{outcome}</span>
                            </li>
                        ))}
                    </ul>
                </article>

                <article className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center bg-accent text-accent-foreground">
                            <ClipboardCheck className="size-5" />
                        </span>
                        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {t.guide.rules.title}
                        </h3>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">{t.guide.rules.lead}</p>
                    <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                        {t.guide.rules.items.map(([label, text]) => (
                            <div className="border-l-2 border-primary/40 pl-3" key={label}>
                                <dt className="font-display text-sm font-semibold text-foreground">{label}</dt>
                                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{text}</dd>
                            </div>
                        ))}
                    </dl>
                </article>

                <article className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center bg-accent text-accent-foreground">
                            <Trophy className="size-5" />
                        </span>
                        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {t.guide.judging.title}
                        </h3>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm font-medium text-foreground">{t.guide.judging.lead}</p>
                    <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                        {t.guide.judging.items.map((item, index) => (
                            <li className="flex items-baseline gap-3 text-sm text-foreground" key={item}>
                                <span className="font-display text-xs font-bold text-primary">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ol>
                </article>

                <article className="p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center bg-accent text-accent-foreground">
                            <FileText className="size-5" />
                        </span>
                        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                            {t.guide.submission.title}
                        </h3>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">{t.guide.submission.lead}</p>
                    <p className="mt-5 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t.guide.submission.checklistLabel}
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                        {t.guide.submission.checklist.map((item) => (
                            <li className="flex gap-2 text-foreground" key={item}>
                                <span
                                    aria-hidden="true"
                                    className="mt-1 flex size-4 shrink-0 items-center justify-center border-2 border-border"
                                >
                                    <span className="size-1.5 bg-primary" />
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{t.guide.submission.finalizeNote}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.guide.submission.repositoryNote}</p>
                    <Link className={buttonVariants({ variant: "brand", className: "mt-5" })} href="/team/submit">
                        {t.guide.submission.cta}
                        <ArrowUpRight className="size-4" />
                    </Link>
                </article>
            </PosterPanel>
        </section>
    );
}
