import Image from "next/image";
import { getPublicMemberCard } from "@/lib/data/public-member-cards";
import { ShareCardButton } from "./_components/share-card-button";

type PublicCardPageProps = { params: Promise<{ token: string }> };

export default async function PublicMemberCardPage({ params }: PublicCardPageProps) {
    const { token } = await params;
    const cardUrl = await getPublicMemberCard(token);

    if (!cardUrl) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6 py-12">
                <section className="w-full max-w-lg rounded-3xl  p-10 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                        KBU Hackathon 2026
                    </p>
                    <h1 className="mt-4 text-3xl font-bold text-zinc-950">Participant Card not found</h1>
                    <p className="mt-3 text-zinc-600">
                        This card link may be invalid, expired, or no longer available.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6 py-12">
            <section className="w-full max-w-3xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-100/60">
                <Image
                    alt="KBU Hackathon participant card"
                    className="h-auto w-full"
                    height={630}
                    priority
                    src={cardUrl}
                    unoptimized
                    width={1200}
                />
                <div className="border-t border-orange-100 bg-orange-50/60 p-6 text-center">
                    <ShareCardButton />
                </div>
            </section>
        </main>
    );
}
