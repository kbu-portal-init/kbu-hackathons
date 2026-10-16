import { Coffee, ExternalLink, Info, MessageCircle, Trophy, Wifi } from "lucide-react";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getLineContact } from "@/lib/public-data/line-contact";

export async function AboutContent() {
    const lineContact = getLineContact();
    const t = getMessages(await getLocale()).about;

    return (
        <section id="everything-you-need-to-know" className="scroll-mt-24">
            <p className="font-mono text-sm font-medium text-orange-600">{"// everything_you_need_to_know"}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{t.title}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-muted-foreground">{t.description}</p>
            <div className="mt-6">
                <p className="font-semibold text-foreground">{t.directionsLabel}</p>
                <ul className="mt-3 grid list-disc gap-2 pl-5 text-brand-muted-foreground sm:grid-cols-2">
                    {t.directions.map((direction) => (
                        <li key={direction}>{direction}</li>
                    ))}
                </ul>
                <p className="mt-4 text-base text-brand-muted-foreground">{t.directionsNote}</p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
                <article className="border-l-2 border-orange-500 pl-5">
                    <p className="text-sm font-semibold text-orange-700">Day 1</p>
                    <h3 className="mt-2 text-xl font-bold text-foreground">{t.day1}</h3>
                    <p className="mt-3 leading-6 text-brand-muted-foreground">{t.day1Text}</p>
                </article>
                <article className="border-l-2 border-orange-500 pl-5">
                    <p className="text-sm font-semibold text-orange-700">Day 2</p>
                    <h3 className="mt-2 text-xl font-bold text-foreground">{t.day2}</h3>
                    <p className="mt-3 leading-6 text-brand-muted-foreground">{t.day2Text}</p>
                </article>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="border border-orange-200 bg-white p-5">
                    <Info className="size-5 text-orange-600" />
                    <h3 className="mt-4 font-bold text-foreground">{t.teamsKnow}</h3>
                    <p className="mt-2 leading-6 text-brand-muted-foreground">{t.teamsKnowText}</p>
                </div>
                <div className="border border-orange-200 bg-white p-5">
                    <div className="flex items-center gap-3 text-orange-600">
                        <Coffee className="size-5" />
                        <Wifi className="size-5" />
                    </div>
                    <h3 className="mt-4 font-bold text-foreground">{t.support}</h3>
                    <p className="mt-2 leading-6 text-brand-muted-foreground">{t.supportText}</p>
                </div>
            </div>

            <div className="mt-8 border border-orange-200 bg-orange-100/70 p-5">
                <div className="flex items-start gap-2 text-orange-700">
                    <Trophy className="mt-0.5 size-5 shrink-0" />
                    <div>
                        <h3 className="font-bold">{t.prizes}</h3>
                        <p className="mt-2 text-orange-950/70">{t.prizesText}</p>
                    </div>
                </div>
            </div>

            <div
                id="need-help"
                className="mt-8 flex scroll-mt-24 flex-col gap-4 border border-orange-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-5 shrink-0 text-orange-600" />
                    <div>
                        <h3 className="font-bold text-foreground">{t.help}</h3>
                        <p className="mt-1 text-brand-muted-foreground">{t.helpText}</p>
                    </div>
                </div>
                <a
                    href={lineContact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600/90"
                >
                    <span>{lineContact.name}</span>
                    <ExternalLink className="size-4" />
                </a>
            </div>

            <div id="faq" className="mt-14 scroll-mt-24 border-t border-orange-200 pt-10">
                <p className="font-mono text-sm font-medium text-orange-600">{"// faq"}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{t.faqTitle}</h2>

                <div className="mt-8 divide-y divide-orange-200 border-y border-orange-200">
                    {t.faq.map(([question, answer]) => (
                        <details key={question} className="faq-disclosure group py-5 first:pt-6 last:pb-6">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 [&::-webkit-details-marker]:hidden">
                                <span>{question}</span>

                                <span
                                    className="shrink-0 text-2xl leading-none text-orange-600 transition-transform duration-200 group-open:rotate-45"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            </summary>

                            <p className="mt-3 max-w-3xl pr-10 leading-7 text-brand-muted-foreground">{answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
