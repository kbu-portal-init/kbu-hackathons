"use client";

import { CheckCircle2, Clock, ExternalLink, Info, Mail, ShieldCheck, Sparkles, Tag } from "lucide-react";
import {
    AwsIcon,
    AzureIcon,
    FigmaIcon,
    GithubIcon,
    GoogleIcon,
    JetBrainsIcon,
    NotionIcon,
} from "@/components/resources/brand-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { StudentBenefit } from "@/lib/data/student-benefits";

interface StudentBenefitDetailSheetProps {
    benefit: StudentBenefit | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function renderBenefitIcon(iconName: StudentBenefit["iconName"]) {
    const iconClass = "h-7 w-7 sm:h-8 sm:w-8";
    switch (iconName) {
        case "github":
            return <GithubIcon className={iconClass} />;
        case "figma":
            return <FigmaIcon className={iconClass} />;
        case "google":
            return <GoogleIcon className={iconClass} />;
        case "aws":
            return <AwsIcon className={iconClass} />;
        case "code":
            return <JetBrainsIcon className={iconClass} />;
        case "azure":
            return <AzureIcon className={iconClass} />;
        case "notion":
            return <NotionIcon className={iconClass} />;
        default:
            return <Sparkles className={iconClass} />;
    }
}

export function StudentBenefitDetailSheet({ benefit, open, onOpenChange }: StudentBenefitDetailSheetProps) {
    if (!benefit) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col overflow-y-auto border-l border-orange-100/60 bg-white p-0 shadow-2xl sm:max-w-xl dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Header Banner */}
                <div className="border-b border-zinc-100 bg-gradient-to-b from-orange-50/50 to-white p-6 dark:border-zinc-800/80 dark:from-orange-950/20 dark:to-zinc-950">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md ring-4 ring-orange-100 dark:ring-orange-950/50">
                            {renderBenefitIcon(benefit.iconName)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {benefit.categories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="rounded-md bg-orange-100/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
                                    >
                                        {cat}
                                    </span>
                                ))}
                                {benefit.badge && (
                                    <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                        {benefit.badge}
                                    </span>
                                )}
                                {benefit.valueBadge && (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        {benefit.valueBadge}
                                    </span>
                                )}
                            </div>
                            <SheetHeader className="mt-2 p-0 text-left">
                                <SheetTitle className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
                                    {benefit.title}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Provided by{" "}
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {benefit.provider}
                                    </span>
                                    {benefit.postedDate && <> • Verified for {benefit.postedDate}</>}
                                </SheetDescription>
                            </SheetHeader>
                        </div>
                    </div>

                    {benefit.pricingNote && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange-200/80 bg-orange-50/80 p-3 text-xs font-medium text-orange-900 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200">
                            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                            <div>
                                <span className="font-semibold">Student Pricing Term: </span>
                                {benefit.pricingNote}
                            </div>
                        </div>
                    )}
                </div>

                {/* Body Content */}
                <div className="flex-1 space-y-6 p-6">
                    {/* Overview */}
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Overview
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {benefit.description}
                        </p>
                    </div>

                    {/* What's Included */}
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                                What&apos;s Included Free
                            </h3>
                        </div>
                        <ul className="mt-3 space-y-2.5">
                            {benefit.perks.map((perk) => (
                                <li
                                    key={perk}
                                    className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Eligibility */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">Eligibility Requirement</h4>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-emerald-950 sm:text-sm dark:text-emerald-200">
                            {benefit.eligibility}
                        </p>
                    </div>

                    {/* Step-by-Step Claim Walkthrough */}
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                                How to Claim Step-by-Step
                            </h3>
                        </div>
                        <ol className="mt-3.5 space-y-3">
                            {benefit.howToClaim.map((step, idx) => (
                                <li
                                    key={step}
                                    className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 font-mono text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                        {idx + 1}
                                    </span>
                                    <p className="text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Restrictions Note if provided */}
                    {benefit.restrictionsNote && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                            <div>
                                <span className="font-semibold">Terms & Limitations: </span>
                                {benefit.restrictionsNote}
                            </div>
                        </div>
                    )}

                    {/* KBU Email Quick Note */}
                    <div className="flex items-center justify-between rounded-xl bg-orange-50/70 p-3.5 text-xs text-orange-900 dark:bg-orange-950/30 dark:text-orange-200">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                            <span>
                                Student email: <code className="font-mono font-bold">u[StudentID]@ms.kbu.ac.th</code>
                            </span>
                        </div>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-800 dark:text-orange-300"
                        >
                            Open Outlook
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 border-t border-zinc-100 bg-white/95 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Close
                        </Button>
                        <a
                            href={benefit.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:w-auto"
                        >
                            <span>Claim on {benefit.provider}</span>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
