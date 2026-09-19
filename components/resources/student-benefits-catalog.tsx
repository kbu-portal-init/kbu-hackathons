"use client";

import { ArrowRight, CheckCircle2, ExternalLink, Gift, Mail, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
    AwsIcon,
    AzureIcon,
    FigmaIcon,
    GithubIcon,
    GoogleIcon,
    JetBrainsIcon,
    NotionIcon,
} from "@/components/resources/brand-icons";
import { StudentEmailGuideSection } from "@/components/resources/student-email-guide";
import {
    type StudentBenefit,
    type StudentBenefitCategory,
    studentBenefitCategories,
    studentBenefits,
} from "@/lib/public-data/student-benefits";

function renderCardIcon(iconName: StudentBenefit["iconName"]) {
    const iconClass = "h-6 w-6 sm:h-7 sm:w-7";
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

export function StudentBenefitsCatalog() {
    const [selectedCategory, setSelectedCategory] = useState<StudentBenefitCategory>("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBenefits = useMemo(() => {
        return studentBenefits.filter((item) => {
            const matchesCategory =
                selectedCategory === "All" ||
                item.categories.includes(selectedCategory as Exclude<StudentBenefitCategory, "All">);

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.provider.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.perks.some((p) => p.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const scrollToEmailGuide = () => {
        const el = document.getElementById("student-email-guide");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div>
            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 p-5 sm:mb-12 sm:p-10 lg:p-12 dark:border-orange-900/40 dark:from-zinc-900 dark:via-zinc-950 dark:to-orange-950/20">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-orange-700 shadow-2xs backdrop-blur-xs dark:border-orange-900/60 dark:bg-zinc-900/90 dark:text-orange-300">
                        <Sparkles className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        <span>Available for All Enrolled KBU Students</span>
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-50">
                        Student Benefits &amp; Developer Packs
                    </h1>

                    <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 sm:text-base lg:text-lg dark:text-zinc-300">
                        Unlock over <span className="font-semibold text-zinc-900 dark:text-zinc-100">$200,000+</span> in
                        industry-standard software, AI coding assistants, cloud credits, and educational licenses using
                        your official KBU student credentials.
                    </p>

                    {/* Quick Access Actions */}
                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={scrollToEmailGuide}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300/80 bg-orange-100/70 px-4 py-2.5 text-xs font-semibold text-orange-800 transition hover:bg-orange-200/80 active:scale-95 sm:text-sm dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-200"
                        >
                            <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span>Need student email? View Login Guide</span>
                            <span className="text-orange-600">↓</span>
                        </button>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-2xs transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 sm:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            <span>Open Outlook Webmail</span>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                        </a>
                    </div>
                </div>

                {/* Ambient background decoration */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10"
                />
            </div>

            {/* Filter & Search Bar */}
            <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
                            Explore Verified Offers
                        </h2>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            Showing {filteredBenefits.length} of {studentBenefits.length} developer packs and student
                            benefits
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="relative flex w-full items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 shadow-2xs transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 sm:max-w-xs dark:border-zinc-800 dark:bg-zinc-900">
                        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tools, cloud, IDEs..."
                            className="w-full min-w-0 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 outline-none dark:text-zinc-100"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Pills (swipeable horizontal scroll on mobile) */}
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                    {studentBenefitCategories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:px-4 ${
                                    isActive
                                        ? "bg-orange-600 text-white shadow-xs"
                                        : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Benefits Cards Grid */}
            {filteredBenefits.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBenefits.map((benefit) => (
                        <div
                            key={benefit.id}
                            className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-2xs transition hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-lg sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-orange-500/30"
                        >
                            <div>
                                {/* Top row: Brand Icon & Badges */}
                                <div className="mb-3.5 flex items-center justify-between gap-2 sm:mb-4">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white sm:h-12 sm:w-12 dark:bg-orange-950/60 dark:text-orange-300 dark:group-hover:bg-orange-600 dark:group-hover:text-white"
                                        aria-label={`View ${benefit.title} details`}
                                    >
                                        {renderCardIcon(benefit.iconName)}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {benefit.valueBadge && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:px-2.5 sm:text-xs dark:bg-emerald-950/60 dark:text-emerald-300">
                                                {benefit.valueBadge}
                                            </span>
                                        )}
                                        {benefit.badge && (
                                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 sm:px-2.5 sm:text-xs dark:bg-orange-950/60 dark:text-orange-300">
                                                {benefit.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Category Tags */}
                                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                    {benefit.categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                {/* Title & Provider */}
                                <Link
                                    href={`/resources/${benefit.id}`}
                                    className="block text-base font-bold text-zinc-900 transition group-hover:text-orange-600 sm:text-lg lg:text-xl dark:text-zinc-50 dark:group-hover:text-orange-400"
                                >
                                    {benefit.title}
                                </Link>
                                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">By {benefit.provider}</p>

                                <p className="mt-2 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
                                    {benefit.tagline}
                                </p>

                                {/* Key Highlights */}
                                <div className="mt-3.5 border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Highlights
                                    </p>
                                    <ul className="mt-2 space-y-1.5">
                                        {benefit.perks.slice(0, 3).map((perk) => (
                                            <li
                                                key={perk}
                                                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
                                                <span className="line-clamp-2">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-5 border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-600 hover:text-white dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-600 dark:hover:text-white"
                                    >
                                        <span>View Claim Guide</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    <a
                                        href={benefit.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 text-zinc-600 shadow-2xs transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                        title={`Direct claim link on ${benefit.provider}`}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span className="sr-only">Claim on {benefit.provider}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
                    <Gift className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                    <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        No student benefits found
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        No perks matched your query &quot;{searchQuery}&quot;. Try adjusting your keywords or reset
                        filters.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
                        className="mt-4 rounded-full bg-orange-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Student Institutional Email Guide Section */}
            <div className="mt-12 border-t border-zinc-200 pt-8 sm:mt-16 sm:pt-10 dark:border-zinc-800">
                <StudentEmailGuideSection />
            </div>
        </div>
    );
}
