"use client";

import { cn } from "cn";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            <section className="mb-10 border-2 border-border bg-card sm:mb-14">
                <div className="border-b-2 border-border bg-accent text-accent-foreground px-5 py-3 sm:px-8">
                    <p className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-foreground">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.availableBadge}
                    </p>
                </div>

                <div className="p-5 sm:p-8 lg:p-10">
                    <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-tight text-foreground">
                        {t.heading}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                        {t.introBefore}
                        <span className="font-semibold text-foreground">{t.introValue}</span>
                        {t.introAfter}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={scrollToEmailGuide}
                            className={buttonVariants({ variant: "accent" })}
                        >
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            {t.emailGuideButton}
                        </button>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: "outline" })}
                        >
                            {t.openWebmail}
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </section>

            <div className="mb-6 space-y-4 border-b-2 border-border/15 pb-6 sm:mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {t.exploreTitle}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t.showing(filteredBenefits.length, studentBenefits.length)}
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            aria-label={t.searchPlaceholder}
                            className="h-11 w-full pl-9 pr-10 text-sm appearance-none [&::-webkit-search-cancel-button]:appearance-none"
                        />
                        {searchQuery && (
                            <Button
                                type="button"
                                size="icon-xs"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => setSearchQuery("")}
                                aria-label={t.clearSearch}
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
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
                                className={cn(
                                    buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
                                    !isActive && "border-border/20 bg-card text-muted-foreground hover:border-border",
                                )}
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
                            className="group flex flex-col justify-between border-2 border-border bg-card transition-transform duration-200 hover:-translate-y-1"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className="flex h-12 w-12 items-center justify-center border-2 border-border bg-accent text-accent-foreground transition-colors group-hover:bg-foreground group-hover:text-background"
                                        aria-label={t.viewDetails(benefit.title)}
                                    >
                                        {renderCardIcon(benefit.iconName)}
                                    </Link>
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        {benefit.valueBadge && (
                                            <span className="border-2 border-border bg-card px-2 py-0.5 font-display text-[10px] font-semibold text-foreground">
                                                {benefit.valueBadge}
                                            </span>
                                        )}
                                        {benefit.badge && (
                                            <span className="border-2 border-border bg-secondary px-2 py-0.5 font-display text-[10px] font-semibold text-secondary-foreground">
                                                {benefit.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                    {benefit.categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="border border-border/20 px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-widest text-muted-foreground"
                                        >
                                            {t.categories[cat]}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    href={`/resources/${benefit.id}`}
                                    className="block font-display text-lg font-semibold leading-6 text-foreground transition-colors group-hover:underline sm:text-xl"
                                >
                                    {benefit.title}
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">{t.byProvider(benefit.provider)}</p>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.tagline}</p>

                                <div className="mt-4 border-t-2 border-border/15 pt-3">
                                    <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        {t.highlights}
                                    </p>
                                    <ul className="mt-2 space-y-1.5">
                                        {benefit.perks.slice(0, 3).map((perk) => (
                                            <li
                                                key={perk}
                                                className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                                            >
                                                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                                                <span className="line-clamp-2">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t-2 border-border p-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/resources/${benefit.id}`}
                                        className={cn(buttonVariants({ size: "sm" }), "h-10 flex-1")}
                                    >
                                        {t.viewClaimGuide}
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                    <a
                                        href={benefit.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
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
                <div className="border-2 border-border bg-card p-12 text-center">
                    <Gift className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{t.noResultsTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t.noResults(searchQuery)}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
                        className={cn(buttonVariants(), "mt-5")}
                    >
                        {t.resetFilters}
                    </button>
                </div>
            )}

            <div className="mt-14 border-t-2 border-border pt-10 sm:mt-20">
                <StudentEmailGuideSection locale={locale} />
            </div>
        </div>
    );
}
