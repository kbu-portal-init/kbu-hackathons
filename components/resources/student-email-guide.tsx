"use client";

import { AlertCircle, Check, Copy, ExternalLink, HelpCircle, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatBenefitDate, getStudentEmailGuide } from "@/lib/public-data/student-benefits";

export function StudentEmailGuideSection({ locale }: { locale: Locale }) {
    const [copied, setCopied] = useState(false);
    const t = getMessages(locale).resourcesPage.emailGuide;
    const studentEmailGuide = getStudentEmailGuide(locale);

    const handleCopyFormat = async () => {
        try {
            await navigator.clipboard.writeText(studentEmailGuide.formatExample);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = studentEmailGuide.formatExample;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <section
            id="student-email-guide"
            aria-labelledby="student-email-guide-heading"
            className="scroll-mt-24 border-2 border-brand-ink bg-card"
        >
            <div className="border-b-2 border-brand-ink bg-brand-yellow px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-brand-ink bg-brand-ink text-brand-paper">
                            <Mail className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="border-2 border-brand-ink bg-brand-paper px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink">
                                    {t.badge}
                                </span>
                                <span className="font-display text-xs text-brand-ink/70">
                                    {t.updated(formatBenefitDate(studentEmailGuide.postedDate, locale))}
                                </span>
                            </div>
                            <h2
                                id="student-email-guide-heading"
                                className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-brand-ink sm:text-2xl"
                            >
                                {t.heading}
                            </h2>
                        </div>
                    </div>

                    <a
                        href={studentEmailGuide.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-brand-ink bg-brand-ink px-5 py-2.5 font-display text-sm font-semibold text-brand-paper transition-colors hover:bg-brand-paper hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                        {getMessages(locale).resourcesPage.openWebmail}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </div>

            <div className="space-y-8 p-5 sm:p-8">
                <p className="max-w-3xl text-sm leading-7 text-brand-muted-foreground sm:text-base">
                    {studentEmailGuide.description}
                </p>

                <div className="flex flex-col gap-4 border-2 border-brand-ink bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="border-2 border-brand-ink bg-brand-paper p-2 text-brand-ink">
                            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground sm:text-xs">
                                {t.formatLabel}
                            </p>
                            <p className="mt-1 font-mono text-sm font-bold text-brand-ink sm:text-lg">
                                {studentEmailGuide.formatExample}
                            </p>
                            <p className="mt-1 text-xs text-secondary-foreground">
                                {t.replaceBefore}
                                <span className="font-semibold">xxxxxxxxxxxx</span>
                                {t.replaceAfter}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopyFormat}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start border-2 border-brand-ink bg-card px-4 py-2 font-display text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                                <span>{t.copied}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{t.copy}</span>
                            </>
                        )}
                    </button>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                        {t.walkthrough}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {studentEmailGuide.steps.map((step) => (
                            <div
                                key={step.stepNumber}
                                className="flex flex-col justify-between border-2 border-brand-ink/15 bg-card p-4 transition-colors hover:border-brand-ink"
                            >
                                <div>
                                    <span className="font-display text-2xl font-bold leading-none text-primary">
                                        {step.stepNumber}
                                    </span>
                                    <h4 className="mt-2 font-display text-sm font-semibold text-brand-ink">
                                        {step.title}
                                    </h4>
                                    <p className="mt-1 text-xs leading-6 text-brand-muted-foreground">{step.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-2 border-brand-ink/15 bg-brand-paper p-4 sm:p-5">
                    <div className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
                        <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{t.tips}</span>
                    </div>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {studentEmailGuide.tips.map((tip) => (
                            <li
                                key={tip}
                                className="flex items-start gap-2.5 text-xs leading-6 text-brand-muted-foreground"
                            >
                                <AlertCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
