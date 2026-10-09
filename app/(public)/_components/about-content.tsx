import { Coffee, ExternalLink, Info, MessageCircle, Trophy, Wifi } from "lucide-react";
import { getLineContact } from "@/lib/public-data/line-contact";

export function AboutContent() {
    const lineContact = getLineContact();

    return (
        <section id="everything-you-need-to-know" className="scroll-mt-24">
            <p className="font-mono text-sm font-medium text-orange-600">{"// everything_you_need_to_know"}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">A solution-building hackathon</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-muted-foreground">
                This is not a game or quiz. Teams will create a digital prototype that responds to a practical
                real-world challenge.
            </p>
            <div className="mt-6">
                <p className="font-semibold text-foreground">Possible directions may include:</p>
                <ul className="mt-3 grid list-disc gap-2 pl-5 text-brand-muted-foreground sm:grid-cols-2">
                    {[
                        "Public services",
                        "Communication",
                        "Safety",
                        "Sustainability",
                        "Community support",
                        "Another practical area",
                    ].map((direction) => (
                        <li key={direction}>{direction}</li>
                    ))}
                </ul>
                <p className="mt-4 text-base text-brand-muted-foreground">
                    These are examples only. The final theme and scope will be announced when the event begins.
                </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
                <article className="border-l-2 border-orange-500 pl-5">
                    <p className="text-sm font-semibold text-orange-700">Day 1</p>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Build and submit</h3>
                    <p className="mt-3 leading-6 text-brand-muted-foreground">
                        The challenge direction is announced at the start of the event. Teams build in person and submit
                        their prototype on the first day.
                    </p>
                </article>
                <article className="border-l-2 border-orange-500 pl-5">
                    <p className="text-sm font-semibold text-orange-700">Day 2</p>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Present and celebrate</h3>
                    <p className="mt-3 leading-6 text-brand-muted-foreground">
                        Teams present their prototypes to university professors acting as judges. Winners are announced
                        after the presentations.
                    </p>
                </article>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="border border-orange-200 bg-white p-5">
                    <Info className="size-5 text-orange-600" />
                    <h3 className="mt-4 font-bold text-foreground">What teams should know</h3>
                    <p className="mt-2 leading-6 text-brand-muted-foreground">
                        This is an in-person event for KBU students. Teams may choose their own problem, approach, and
                        technology within the event rules.
                    </p>
                </div>
                <div className="border border-orange-200 bg-white p-5">
                    <div className="flex items-center gap-3 text-orange-600">
                        <Coffee className="size-5" />
                        <Wifi className="size-5" />
                    </div>
                    <h3 className="mt-4 font-bold text-foreground">Event support</h3>
                    <p className="mt-2 leading-6 text-brand-muted-foreground">
                        Snacks, coffee, KBU Wi-Fi, and backup Wi-Fi support will be available.
                    </p>
                </div>
            </div>

            <div className="mt-8 border border-orange-200 bg-orange-100/70 p-5">
                <div className="flex items-start gap-2 text-orange-700">
                    <Trophy className="mt-0.5 size-5 shrink-0" />
                    <div>
                        <h3 className="font-bold">Prizes and awards</h3>
                        <p className="mt-2 text-orange-950/70">
                            Prize and reward details will be announced by the event team.
                        </p>
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
                        <h3 className="font-bold text-foreground">Need help?</h3>
                        <p className="mt-1 text-brand-muted-foreground">
                            Join our official LINE group to connect with organizers and get event support.
                        </p>
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
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Questions, answered</h2>

                <div className="mt-8 divide-y divide-orange-200 border-y border-orange-200">
                    {[
                        ["Who can participate?", "The hackathon is open to current KBU students."],
                        [
                            "Can I register by myself or join more than one team?",
                            "Registration is for teams, and each participant may join only one team.",
                        ],
                        [
                            "How many people can be on a team?",
                            "The minimum and maximum team size are shown on the registration form and are configured for the event.",
                        ],
                        [
                            "What happens after we register?",
                            "Every team member must verify their student email. The organizers then review and approve the registration before the team account is activated.",
                        ],
                        [
                            "Where do we submit our project?",
                            "Approved teams submit their project through the protected team dashboard during the submission period.",
                        ],
                        [
                            "How will projects be judged?",
                            "Judges will consider how clearly the project addresses a practical problem, the usefulness and creativity of the solution, the quality of the prototype, how well the team explains and demonstrates it, and the potential impact of the idea.",
                        ],
                        [
                            "Can we use AI tools or pre-written code?",
                            "AI tools are allowed. Pre-written code is not allowed because teams should build their project during the event.",
                        ],
                        ["What should we bring?", "Bring your own laptop and a power extension."],
                    ].map(([question, answer]) => (
                        <details key={question} className="group py-5 first:pt-6 last:pb-6">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-semibold text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 [&::-webkit-details-marker]:hidden">
                                <span>{question}</span>
                                <span
                                    className="text-2xl leading-none text-orange-600 transition-transform group-open:rotate-45"
                                    aria-hidden
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
