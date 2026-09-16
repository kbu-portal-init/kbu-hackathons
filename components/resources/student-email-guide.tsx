"use client";

import { AlertCircle, Check, Copy, ExternalLink, HelpCircle, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { studentEmailGuide } from "@/lib/data/student-benefits";

export function StudentEmailGuideSection() {
    const [copied, setCopied] = useState(false);

    const handleCopyFormat = async () => {
        try {
            await navigator.clipboard.writeText(studentEmailGuide.formatExample);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for non-https / secure contexts
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
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/60 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
        >
            {/* Header banner */}
            <div className="border-b border-zinc-200/80 bg-zinc-50/80 px-5 py-5 sm:px-8 sm:py-6 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xs">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                    Official KBU Student Verification
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                    Updated for {studentEmailGuide.postedDate}
                                </span>
                            </div>
                            <h2
                                id="student-email-guide-heading"
                                className="mt-1 text-lg font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
                            >
                                How to Access Your KBU Student Email
                            </h2>
                        </div>
                    </div>

                    <a
                        href={studentEmailGuide.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:text-sm"
                    >
                        <span>Open Outlook Webmail</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>

            <div className="p-5 sm:p-8 space-y-8">
                {/* Description & Format Card */}
                <div className="max-w-3xl">
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {studentEmailGuide.description}
                    </p>
                </div>

                {/* Copyable Format Callout */}
                <div className="flex flex-col gap-4 rounded-2xl border border-orange-200/90 bg-gradient-to-r from-orange-50/90 to-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/20">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600 dark:text-orange-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 sm:text-xs">
                                Your Institutional Email Format
                            </p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-zinc-900 sm:text-lg dark:text-zinc-100">
                                {studentEmailGuide.formatExample}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                Replace{" "}
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">xxxxxxxxxxxx</span>{" "}
                                with your 12-digit student ID number.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopyFormat}
                        className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-2xs transition hover:bg-orange-50 active:scale-95 sm:self-center dark:border-orange-900/60 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">Format Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                                <span>Copy Format</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 4-Step Login Walkthrough */}
                <div>
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        4-Step Login Walkthrough
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {studentEmailGuide.steps.map((step) => (
                            <div
                                key={step.stepNumber}
                                className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs transition hover:border-orange-500/30 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
                            >
                                <div>
                                    <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                                        {step.stepNumber}
                                    </span>
                                    <h4 className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {step.title}
                                    </h4>
                                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                        {step.detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Helpful Verification Tips */}
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span>Important Tips for Student Verification</span>
                    </div>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                        {studentEmailGuide.tips.map((tip) => (
                            <li
                                key={tip}
                                className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                            >
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500 dark:text-orange-400" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
