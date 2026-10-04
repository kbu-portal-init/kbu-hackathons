import { Coffee, ExternalLink, MessageCircle, ShieldCheck, Trophy, Wifi } from "lucide-react";
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
                    <p className="mt-3 text-sm leading-6 text-brand-muted-foreground">
                        The challenge direction is announced at the start of the event. Teams build in person and submit
                        their prototype on the first day.
                    </p>
                </article>
                <article className="border-l-2 border-orange-500 pl-5">
                    <p className="text-sm font-semibold text-orange-700">Day 2</p>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Present and celebrate</h3>
                    <p className="mt-3 text-sm leading-6 text-brand-muted-foreground">
                        Teams present their prototypes to university professors acting as judges. Winners are announced
                        after the presentations.
                    </p>
                </article>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="border border-orange-200 bg-white p-5">
                    <ShieldCheck className="size-5 text-orange-600" />
                    <h3 className="mt-4 font-bold text-foreground">What teams should know</h3>
                    <p className="mt-2 text-sm leading-6 text-brand-muted-foreground">
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
                    <p className="mt-2 text-sm leading-6 text-brand-muted-foreground">
                        Snacks, coffee, Wi-Fi, and backup support will be available.
                    </p>
                </div>
            </div>

            <div className="mt-8 border border-orange-200 bg-orange-100/70 p-5">
                <div className="flex items-center gap-2 text-orange-700">
                    <Trophy className="size-5" />
                    <h3 className="font-bold">Prizes and awards</h3>
                </div>
                <p className="mt-2 text-sm text-orange-950/70">
                    Prize pool details will be announced by the event team.
                </p>
            </div>

            <div
                id="need-help"
                className="mt-8 flex scroll-mt-24 flex-col gap-4 border border-orange-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-5 shrink-0 text-orange-600" />
                    <div>
                        <h3 className="font-bold text-foreground">Need help?</h3>
                        <p className="mt-1 text-sm text-brand-muted-foreground">
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
        </section>
    );
}
