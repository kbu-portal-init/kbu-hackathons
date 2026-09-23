import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    ExternalLink,
    Info,
    Mail,
    ShieldCheck,
    Sparkles,
    Tag,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    AwsIcon,
    AzureIcon,
    FigmaIcon,
    GithubIcon,
    GoogleIcon,
    JetBrainsIcon,
    NotionIcon,
} from "@/components/resources/brand-icons";
import { type StudentBenefit, studentBenefits } from "@/lib/public-data/student-benefits";

function renderBrandIcon(iconName: StudentBenefit["iconName"], className = "h-8 w-8 sm:h-10 sm:w-10") {
    switch (iconName) {
        case "github":
            return <GithubIcon className={className} />;
        case "figma":
            return <FigmaIcon className={className} />;
        case "google":
            return <GoogleIcon className={className} />;
        case "aws":
            return <AwsIcon className={className} />;
        case "code":
            return <JetBrainsIcon className={className} />;
        case "azure":
            return <AzureIcon className={className} />;
        case "notion":
            return <NotionIcon className={className} />;
        default:
            return <Sparkles className={className} />;
    }
}

export async function generateStaticParams() {
    return studentBenefits.map((benefit) => ({
        id: benefit.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const benefit = studentBenefits.find((b) => b.id === id);

    if (!benefit) {
        return {
            title: "Student Benefit Not Found | KBU Hackathon 2026",
        };
    }

    return {
        title: `${benefit.title} — Student Claim Guide | KBU Hackathon 2026`,
        description: benefit.description,
    };
}

export default async function StudentBenefitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const benefit = studentBenefits.find((b) => b.id === id);

    if (!benefit) {
        notFound();
    }

    const otherBenefits = studentBenefits.filter((b) => b.id !== benefit.id).slice(0, 3);

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-16 lg:px-8">
            {/* Top Navigation & Breadcrumbs */}
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <li>
                            <Link href="/" className="transition hover:text-orange-600 dark:hover:text-orange-400">
                                Home
                            </Link>
                        </li>
                        <li>
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                        </li>
                        <li>
                            <Link
                                href="/resources"
                                className="transition hover:text-orange-600 dark:hover:text-orange-400"
                            >
                                Resources
                            </Link>
                        </li>
                        <li>
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                        </li>
                        <li
                            className="max-w-[200px] truncate font-semibold text-zinc-900 sm:max-w-none dark:text-zinc-100"
                            aria-current="page"
                        >
                            {benefit.title}
                        </li>
                    </ol>
                </nav>

                <Link
                    href="/resources"
                    className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-zinc-600 transition hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to all benefits</span>
                </Link>
            </div>

            {/* Hero Header Card */}
            <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-orange-50/50 via-white to-white p-5 shadow-xs sm:p-8 lg:p-10 dark:border-zinc-800 dark:from-orange-950/20 dark:via-zinc-900 dark:to-zinc-950">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md ring-4 ring-orange-100 sm:h-20 sm:w-20 dark:ring-orange-950/50">
                            {renderBrandIcon(benefit.iconName)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                {benefit.categories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
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

                            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-zinc-50">
                                {benefit.title}
                            </h1>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <span>Provided by {benefit.provider}</span>
                                {benefit.postedDate && (
                                    <>
                                        <span>•</span>
                                        <span>Verified {benefit.postedDate}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop / Tablet Claim Button */}
                    <div className="hidden shrink-0 sm:block">
                        <a
                            href={benefit.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                        >
                            <span>Claim on {benefit.provider}</span>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Pricing / Special Term Banner */}
                {benefit.pricingNote && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-orange-200/80 bg-orange-50/80 p-3.5 text-xs font-medium text-orange-900 sm:mt-6 sm:p-4 sm:text-sm dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200">
                        <Tag className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                        <div>
                            <span className="font-semibold">Special Student Pricing: </span>
                            {benefit.pricingNote}
                        </div>
                    </div>
                )}

                <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
                    {benefit.description}
                </p>
            </section>

            {/* Main Content Grid */}
            <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
                {/* Section: What's Included */}
                <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
                            What&apos;s Included Free
                        </h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        Exclusive features unlocked with student academic status
                    </p>

                    <ul className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
                        {benefit.perks.map((perk) => (
                            <li
                                key={perk}
                                className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3.5 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:text-zinc-300"
                            >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span>{perk}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Restrictions Note if provided */}
                    {benefit.restrictionsNote && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3.5 text-xs text-zinc-600 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                            <div>
                                <span className="font-semibold">Terms &amp; Restrictions: </span>
                                {benefit.restrictionsNote}
                            </div>
                        </div>
                    )}
                </section>

                {/* Section: Eligibility Requirement */}
                <section className="rounded-3xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 p-5 sm:p-6 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="h-5 w-5 shrink-0" />
                        <h2 className="text-sm font-bold uppercase tracking-wider sm:text-base">
                            Eligibility Requirement
                        </h2>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-950 sm:text-sm dark:text-emerald-200">
                        {benefit.eligibility}
                    </p>
                </section>

                {/* Section: Step-by-Step Claim Walkthrough */}
                <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
                            How to Claim This Student Offer
                        </h2>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        Follow these exact steps to complete verification
                    </p>

                    <ol className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
                        {benefit.howToClaim.map((step, idx) => (
                            <li
                                key={step}
                                className="flex items-start gap-3.5 rounded-2xl border border-zinc-100 bg-white p-4 shadow-2xs sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/80"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 font-mono text-xs font-bold text-orange-700 sm:h-8 sm:w-8 sm:text-sm dark:bg-orange-950 dark:text-orange-300">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <p className="pt-0.5 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300">
                                    {step}
                                </p>
                            </li>
                        ))}
                    </ol>

                    {/* KBU Email Helper Inside Steps */}
                    <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-orange-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:bg-orange-950/30">
                        <div className="flex items-start gap-2.5">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                            <div>
                                <p className="text-xs font-bold text-orange-900 dark:text-orange-200">
                                    Need to check your student email?
                                </p>
                                <p className="text-xs text-orange-800/80 dark:text-orange-300">
                                    Format: <code className="font-mono font-bold">u[StudentID]@ms.kbu.ac.th</code>
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://outlook.cloud.microsoft/mail/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-800 sm:self-center dark:text-orange-300"
                        >
                            Open Outlook Webmail
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </section>

                {/* Section: Other Recommended Perks */}
                <section className="pt-4">
                    <h2 className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
                        Other Recommended Perks
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        Explore more developer packs available for KBU students
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {otherBenefits.map((item) => (
                            <Link
                                key={item.id}
                                href={`/resources/${item.id}`}
                                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs transition hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300">
                                            {renderBrandIcon(item.iconName, "h-5 w-5")}
                                        </div>
                                        {item.valueBadge && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                {item.valueBadge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-3 text-sm font-bold text-zinc-900 transition group-hover:text-orange-600 dark:text-zinc-100 dark:group-hover:text-orange-400">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        {item.tagline}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                    <span>Read Guide</span>
                                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* Mobile Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">{benefit.title}</p>
                        <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                            {benefit.provider} • {benefit.valueBadge}
                        </p>
                    </div>
                    <a
                        href={benefit.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-95"
                    >
                        <span>Claim Now</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </main>
    );
}
