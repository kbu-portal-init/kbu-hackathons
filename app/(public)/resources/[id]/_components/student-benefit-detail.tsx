import { ArrowRight, CheckCircle2, Clock, ExternalLink, Info, Mail, ShieldCheck, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { PosterBreadcrumb } from "@/components/poster-breadcrumb";
import { PosterPanel } from "@/components/poster-panel";
import {
    AwsIcon,
    AzureIcon,
    FigmaIcon,
    GithubIcon,
    GoogleIcon,
    JetBrainsIcon,
    NotionIcon,
} from "@/components/resources/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { formatBenefitDate, getStudentBenefits, type StudentBenefit } from "@/lib/public-data/student-benefits";

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

export async function StudentBenefitDetail({ id }: { id: string }) {
    const locale = await getLocale();
    const messages = getMessages(locale);
    const t = messages.resourcesPage.detail;
    const benefits = getStudentBenefits(locale);
    const benefit = benefits.find((b) => b.id === id);

    if (!benefit) {
        notFound();
    }

    const otherBenefits = benefits.filter((b) => b.id !== benefit.id).slice(0, 3);

    return (
        <main className="flex-1 bg-background pb-24 sm:pb-16">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PosterBreadcrumb
                        items={[
                            { label: messages.common.home, href: "/" },
                            { label: messages.common.resources, href: "/resources" },
                            { label: benefit.title },
                        ]}
                    />
                    <BackButton fallbackHref="/resources" label={t.backToAll} className="self-start" />
                </div>

                <section className="border-2 border-border bg-card">
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-border bg-accent text-accent-foreground px-5 py-3 sm:px-8">
                        {benefit.categories.map((cat) => (
                            <span
                                key={cat}
                                className="border-2 border-border bg-background px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground"
                            >
                                {messages.resourcesPage.categories[cat]}
                            </span>
                        ))}
                        {benefit.badge && (
                            <span className="border-2 border-border bg-foreground px-2.5 py-0.5 font-display text-[10px] font-semibold text-background">
                                {benefit.badge}
                            </span>
                        )}
                        {benefit.valueBadge && (
                            <span className="border-2 border-border bg-secondary px-2.5 py-0.5 font-display text-[10px] font-semibold text-secondary-foreground">
                                {benefit.valueBadge}
                            </span>
                        )}
                    </div>

                    <div className="p-5 sm:p-8 lg:p-10">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4 sm:gap-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-border bg-accent text-accent-foreground sm:h-20 sm:w-20">
                                    {renderBrandIcon(benefit.iconName)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                                        {benefit.title}
                                    </h1>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span>{t.providedBy(benefit.provider)}</span>
                                        {benefit.postedDate && (
                                            <>
                                                <span aria-hidden="true">/</span>
                                                <span>{t.verified(formatBenefitDate(benefit.postedDate, locale))}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden shrink-0 sm:block">
                                <a
                                    href={benefit.officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={buttonVariants()}
                                >
                                    {messages.resourcesPage.claimOn(benefit.provider)}
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </div>
                        </div>

                        {benefit.pricingNote && (
                            <div className="mt-6 flex items-start gap-2.5 border-2 border-border bg-secondary p-4 text-sm text-secondary-foreground">
                                <Tag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <div>
                                    <span className="font-display font-semibold">{t.specialPricing}</span>
                                    {benefit.pricingNote}
                                </div>
                            </div>
                        )}

                        <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
                            {benefit.description}
                        </p>
                    </div>
                </section>

                <div className="mt-8 space-y-8 sm:mt-10">
                    <PosterPanel className="p-5 sm:p-8">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                            <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {t.includedTitle}
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{t.includedSubtitle}</p>

                        <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                            {benefit.perks.map((perk) => (
                                <li
                                    key={perk}
                                    className="flex items-start gap-3 border-2 border-border/15 bg-background p-4 text-sm leading-6 text-foreground"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>

                        {benefit.restrictionsNote && (
                            <div className="mt-5 flex items-start gap-2.5 border-2 border-border/15 bg-background p-4 text-sm text-muted-foreground">
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                <div>
                                    <span className="font-display font-semibold text-foreground">{t.restrictions}</span>
                                    {benefit.restrictionsNote}
                                </div>
                            </div>
                        )}
                    </PosterPanel>

                    <section className="border-2 border-border bg-secondary p-5 sm:p-6">
                        <div className="flex items-center gap-2 text-secondary-foreground">
                            <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <h2 className="font-display text-sm font-bold uppercase tracking-widest sm:text-base">
                                {t.eligibility}
                            </h2>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-secondary-foreground">{benefit.eligibility}</p>
                    </section>

                    <PosterPanel className="p-5 sm:p-8">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                            <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {t.howToClaimTitle}
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{t.howToClaimSubtitle}</p>

                        <ol className="mt-5 space-y-3">
                            {benefit.howToClaim.map((step, idx) => (
                                <li
                                    key={step}
                                    className="flex items-start gap-4 border-2 border-border/15 bg-background p-4 sm:p-5"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-border bg-accent font-display text-sm font-bold text-accent-foreground">
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <p className="pt-1 text-sm leading-7 text-foreground">{step}</p>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-6 flex flex-col gap-3 border-2 border-border bg-accent text-accent-foreground p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="flex items-start gap-2.5">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                                <div>
                                    <p className="font-display text-sm font-semibold text-foreground">{t.checkEmail}</p>
                                    <p className="text-xs text-foreground/75">
                                        {t.emailFormat}
                                        <code className="font-mono font-bold text-foreground">
                                            u[StudentID]@ms.kbu.ac.th
                                        </code>
                                    </p>
                                </div>
                            </div>
                            <a
                                href="https://outlook.cloud.microsoft/mail/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 self-start font-display text-xs font-semibold text-foreground underline decoration-2 underline-offset-4 hover:text-foreground sm:self-center"
                            >
                                {messages.resourcesPage.openWebmail}
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    </PosterPanel>

                    <section className="pt-2">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                            {t.otherPerks}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t.otherPerksSubtitle}</p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            {otherBenefits.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/resources/${item.id}`}
                                    className="group flex flex-col justify-between border-2 border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex h-10 w-10 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                                                {renderBrandIcon(item.iconName, "h-5 w-5")}
                                            </div>
                                            {item.valueBadge && (
                                                <span className="border border-border/20 px-2 py-0.5 font-display text-[10px] font-semibold text-muted-foreground">
                                                    {item.valueBadge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-4 font-display text-base font-semibold text-foreground transition-colors group-hover:underline">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                            {item.tagline}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 font-display text-xs font-semibold text-foreground">
                                        <span>{t.readGuide}</span>
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-background p-3.5 sm:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-semibold text-foreground">{benefit.title}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                            {benefit.provider} / {benefit.valueBadge}
                        </p>
                    </div>
                    <a
                        href={benefit.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ size: "sm" })}
                    >
                        {t.claimNow}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </main>
    );
}
