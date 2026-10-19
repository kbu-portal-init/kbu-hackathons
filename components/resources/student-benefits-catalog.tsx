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
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
    getStudentBenefits,
    type StudentBenefit,
    type StudentBenefitCategory,
    studentBenefitCategories,
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

export function StudentBenefitsCatalog({ locale }: { locale: Locale }) {
    const [selectedCategory, setSelectedCategory] = useState<StudentBenefitCategory>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const t = getMessages(locale).resourcesPage;
    const studentBenefits = useMemo(() => getStudentBenefits(locale), [locale]);

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
    }, [studentBenefits, selectedCategory, searchQuery]);

    const scrollToEmailGuide = () => {
        const el = document.getElementById("student-email-guide");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div>
            <section className="mb-10 border-2 border-brand-ink bg-card sm:mb-14">
                <div className="border-b-2 border-brand-ink bg-brand-yellow px-5 py-3 sm:px-8">
                    <p className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.availableBadge}
                    </p>
                </div>

                <div className="p-5 sm:p-8 lg:p-10">
                    <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-brand-ink">
                        {t.heading}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-brand-muted-foreground sm:text-lg">
                        {t.introBefore}
                        <span className="font-semibold text-brand-ink">{t.introValue}</span>
                        {t.introAfter}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={scrollToEmailGuide}
                            className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-brand-ink bg-brand-yellow px-4 py-2.5 font-display text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            {t.emailGuideButton}
                        </button>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-brand-ink bg-card px-4 py-2.5 font-display text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {t.openWebmail}
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </section>

            <div className="mb-6 space-y-4 border-b-2 border-brand-ink/15 pb-6 sm:mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-brand-ink sm:text-3xl">
                            {t.exploreTitle}
                        </h2>
                        <p className="mt-1 text-sm text-brand-muted-foreground">
                            {t.showing(filteredBenefits.length, studentBenefits.length)}
                        </p>
                    </div>

                    <div className="flex w-full items-center gap-2 border-2 border-brand-ink/25 bg-card px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:max-w-xs">
                        <Search className="h-4 w-4 shrink-0 text-brand-muted-foreground" aria-hidden="true" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full min-w-0 bg-transparent text-sm text-brand-ink placeholder:text-brand-muted-foreground outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="shrink-0 border-2 border-brand-ink bg-brand-ink p-1 text-brand-paper hover:bg-brand-yellow hover:text-brand-ink"
                                aria-label={t.clearSearch}
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                    {studentBenefitCategories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 border-2 px-3.5 py-1.5 font-display text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 ${
                                    isActive
                                        ? "border-brand-ink bg-brand-ink text-brand-paper"
                                        : "border-brand-ink/20 bg-card text-brand-muted-foreground hover:border-brand-ink hover:bg-brand-yellow hover:text-brand-ink"
                                }`}
                            >
                                {t.categories[cat]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {filteredBenefits.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBenefits.map((benefit) => (
                        <article
                            key={benefit.id}
                            className="group flex flex-col justify-between border-2 border-brand-ink bg-card transition-transform duration-200 hover:-translate-y-1"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex h-12 w-12 items-center justify-center border-2 border-brand-ink bg-brand-yellow text-brand-ink transition-colors group-hover:bg-brand-ink group-hover:text-brand-paper"
                                        aria-label={t.viewDetails(benefit.title)}
                                    >
                                        {renderCardIcon(benefit.iconName)}
                                    </Link>
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        {benefit.valueBadge && (
                                            <span className="border-2 border-brand-ink bg-card px-2 py-0.5 font-display text-[10px] font-semibold text-brand-ink">
                                                {benefit.valueBadge}
                                            </span>
                                        )}
                                        {benefit.badge && (
                                            <span className="border-2 border-brand-ink bg-secondary px-2 py-0.5 font-display text-[10px] font-semibold text-secondary-foreground">
                                                {benefit.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                    {benefit.categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="border border-brand-ink/20 px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground"
                                        >
                                            {t.categories[cat]}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    href={`/resources/${benefit.id}`}
                                    className="block font-display text-lg font-semibold leading-6 text-brand-ink transition-colors group-hover:underline sm:text-xl"
                                >
                                    {benefit.title}
                                </Link>
                                <p className="mt-1 text-xs text-brand-muted-foreground">
                                    {t.byProvider(benefit.provider)}
                                </p>

                                <p className="mt-3 text-sm leading-6 text-brand-muted-foreground">{benefit.tagline}</p>

                                <div className="mt-4 border-t-2 border-brand-ink/15 pt-3">
                                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                        {t.highlights}
                                    </p>
                                    <ul className="mt-2 space-y-1.5">
                                        {benefit.perks.slice(0, 3).map((perk) => (
                                            <li
                                                key={perk}
                                                className="flex items-start gap-2 text-sm leading-6 text-brand-muted-foreground"
                                            >
                                                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                                                <span className="line-clamp-2">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t-2 border-brand-ink p-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex min-h-10 flex-1 items-center justify-center gap-1.5 border-2 border-brand-ink bg-brand-ink px-3.5 py-2 font-display text-xs font-semibold text-brand-paper transition-colors hover:bg-brand-yellow hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                    >
                                        {t.viewClaimGuide}
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                    <a
                                        href={benefit.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-10 items-center justify-center border-2 border-brand-ink bg-card p-2 text-brand-ink transition-colors hover:bg-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                        title={t.directClaimLink(benefit.provider)}
                                    >
                                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                        <span className="sr-only">{t.claimOn(benefit.provider)}</span>
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="border-2 border-brand-ink bg-card p-12 text-center">
                    <Gift className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-xl font-semibold text-brand-ink">{t.noResultsTitle}</h3>
                    <p className="mt-2 text-sm text-brand-muted-foreground">{t.noResults(searchQuery)}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
                        className="mt-5 inline-flex min-h-11 items-center justify-center border-2 border-brand-ink bg-brand-ink px-5 py-2 font-display text-sm font-semibold text-brand-paper transition-colors hover:bg-brand-yellow hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        {t.resetFilters}
                    </button>
                </div>
            )}

            <div className="mt-14 border-t-2 border-brand-ink pt-10 sm:mt-20">
                <StudentEmailGuideSection locale={locale} />
            </div>
        </div>
    );
}
