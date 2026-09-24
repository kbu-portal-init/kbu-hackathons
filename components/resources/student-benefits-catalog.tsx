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
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50/60 p-5 sm:mb-12 sm:p-10 lg:p-12">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-1 text-xs font-semibold text-violet-700 shadow-2xs backdrop-blur-xs">
                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                        <span>Available for All Enrolled KBU Students</span>
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Student Benefits &amp; Developer Packs
                    </h1>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                        Unlock over <span className="font-semibold text-foreground">$200,000+</span> in
                        industry-standard software, AI coding assistants, cloud credits, and educational licenses using
                        your official KBU student credentials.
                    </p>

                    {/* Quick Access Actions */}
                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={scrollToEmailGuide}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300 bg-violet-100/70 px-4 py-2.5 text-xs font-semibold text-violet-800 transition hover:bg-violet-200/80 active:scale-95 sm:text-sm"
                        >
                            <Mail className="h-4 w-4 text-violet-600" />
                            <span>Need student email? View Login Guide</span>
                            <span className="text-violet-600">↓</span>
                        </button>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:text-sm"
                        >
                            <span>Open Outlook Webmail</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </a>
                    </div>
                </div>

                {/* Ambient background decoration */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl"
                />
            </div>

            {/* Filter & Search Bar */}
            <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Explore Verified Offers</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Showing {filteredBenefits.length} of {studentBenefits.length} developer packs and student
                            benefits
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="relative flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 sm:max-w-xs">
                        <Search className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tools, cloud, IDEs..."
                            className="w-full min-w-0 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                                        ? "bg-gradient-accent text-white shadow-xs"
                                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
                            className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg sm:p-6"
                        >
                            <div>
                                {/* Top row: Brand Icon & Badges */}
                                <div className="mb-3.5 flex items-center justify-between gap-2 sm:mb-4">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:bg-gradient-accent group-hover:text-white sm:h-12 sm:w-12"
                                        aria-label={`View ${benefit.title} details`}
                                    >
                                        {renderCardIcon(benefit.iconName)}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {benefit.valueBadge && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:px-2.5 sm:text-xs">
                                                {benefit.valueBadge}
                                            </span>
                                        )}
                                        {benefit.badge && (
                                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 sm:px-2.5 sm:text-xs">
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
                                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                {/* Title & Provider */}
                                <Link
                                    href={`/resources/${benefit.id}`}
                                    className="block text-base font-bold text-foreground transition group-hover:text-violet-700 sm:text-lg lg:text-xl"
                                >
                                    {benefit.title}
                                </Link>
                                <p className="mt-0.5 text-xs text-slate-400">By {benefit.provider}</p>

                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    {benefit.tagline}
                                </p>

                                {/* Key Highlights */}
                                <div className="mt-3.5 border-t border-slate-100 pt-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Highlights
                                    </p>
                                    <ul className="mt-2 space-y-1.5">
                                        {benefit.perks.slice(0, 3).map((perk) => (
                                            <li key={perk} className="flex items-start gap-2 text-xs text-slate-600">
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-700" />
                                                <span className="line-clamp-2">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-5 border-t border-slate-100 pt-3.5">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 transition hover:bg-gradient-accent hover:text-white"
                                    >
                                        <span>View Claim Guide</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    <a
                                        href={benefit.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
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
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <Gift className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-base font-semibold text-foreground">No student benefits found</h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                        No perks matched your query &quot;{searchQuery}&quot;. Try adjusting your keywords or reset
                        filters.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
                        className="mt-4 rounded-full bg-gradient-accent px-5 py-2 text-xs font-semibold text-white transition hover:shadow-lg hover:shadow-violet-500/30"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Student Institutional Email Guide Section */}
            <div className="mt-12 border-t border-slate-200 pt-8 sm:mt-16 sm:pt-10">
                <StudentEmailGuideSection />
            </div>
        </div>
    );
}
