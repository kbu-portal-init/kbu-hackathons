import { ExternalLink, MessageCircle } from "lucide-react";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";

export async function AboutContent() {
    const lineContact = getLineContact();
    const t = getMessages(await getLocale()).about;

    return (
        <section id="everything-you-need-to-know" className="scroll-mt-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div>
                    <h2 className="max-w-md font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.92] tracking-tight text-foreground">
                        {t.title}
                    </h2>
                    <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">{t.description}</p>
                </div>

                <div className="border-t-2 border-border">
                    {[
                        { number: "01", title: t.day1, body: t.day1Text },
                        { number: "02", title: t.day2, body: t.day2Text },
                    ].map((day) => (
                        <article
                            key={day.number}
                            className="grid grid-cols-[3rem_1fr] gap-4 border-b-2 border-border/15 py-5 last:border-b-0 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-6"
                        >
                            <p className="font-display text-3xl font-bold leading-none text-primary sm:text-4xl">
                                {day.number}
                            </p>
                            <div>
                                <h3 className="font-display text-xl font-semibold leading-7 text-foreground sm:text-2xl">
                                    {day.title}
                                </h3>
                                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{day.body}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <div className="mt-14 border-2 border-border">
                <div className="border-b-2 border-border bg-accent text-accent-foreground px-5 py-4">
                    <h3 className="font-display text-xl font-semibold text-foreground">{t.directionsLabel}</h3>
                </div>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
                    {t.directions.map((direction) => (
                        <li
                            key={direction}
                            className="flex items-start gap-3 border-b border-border/15 px-5 py-3.5 text-base font-medium text-foreground last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
                        >
                            <span className="mt-2 size-1.5 shrink-0 bg-primary" aria-hidden="true" />
                            {direction}
                        </li>
                    ))}
                </ul>
                <p className="border-t border-border/15 px-5 py-4 text-sm leading-6 text-muted-foreground">
                    {t.directionsNote}
                </p>
            </div>

            <div className="mt-14 grid border-t-2 border-border lg:grid-cols-3">
                <article className="border-b-2 border-border/15 py-6 lg:border-b-0 lg:border-r-2 lg:pr-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t.teamsKnow}</h3>
                    <p className="mt-2 max-w-sm leading-7 text-muted-foreground">{t.teamsKnowText}</p>
                </article>
                <article className="border-b-2 border-border/15 py-6 lg:border-b-0 lg:border-r-2 lg:px-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t.support}</h3>
                    <p className="mt-2 max-w-sm leading-7 text-muted-foreground">{t.supportText}</p>
                </article>
                <article className="py-6 lg:pl-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t.prizes}</h3>
                    <p className="mt-2 max-w-sm leading-7 text-muted-foreground">{t.prizesText}</p>
                </article>
            </div>

            <div
                id="need-help"
                className="mt-10 flex scroll-mt-24 flex-col gap-5 border-2 border-border bg-primary p-5 text-foreground sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <div>
                        <h3 className="font-display text-lg font-semibold">{t.help}</h3>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-foreground">{t.helpText}</p>
                    </div>
                </div>
                <a
                    href={lineContact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border-2 border-border bg-foreground px-5 py-3 font-display text-sm font-semibold text-background transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                    {lineContact.name}
                    <ExternalLink className="size-4" aria-hidden="true" />
                </a>
            </div>

            <div id="faq" className="mt-16 scroll-mt-24 border-t-2 border-border pt-10">
                <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground">
                    {t.faqTitle}
                </h2>

                <div className="mt-7 max-w-4xl border-t-2 border-border">
                    {t.faq.map(([question, answer]) => (
                        <details key={question} className="faq-disclosure group border-b-2 border-border/15">
                            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-display text-base font-semibold text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden sm:text-lg">
                                <span>{question}</span>
                                <span
                                    className="shrink-0 text-2xl leading-none text-primary transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="max-w-3xl pb-5 pr-8 leading-7 text-muted-foreground">{answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
