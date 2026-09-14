import Link from "next/link";

export function RoutePlaceholder({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">{eyebrow}</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
                <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">{description}</p>
                <Link
                    href="/"
                    className="mt-8 inline-flex rounded-full bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                >
                    Back to home
                </Link>
            </div>
        </main>
    );
}
