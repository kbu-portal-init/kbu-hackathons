import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StudentBenefitsCatalog } from "@/components/resources/student-benefits-catalog";

export const metadata: Metadata = {
    title: "Student Benefits & Developer Packs | KBU Hub",
    description:
        "Unlock over $200,000+ in free industry-standard software, AI coding assistants, cloud credits, and developer tools using your official KBU student credentials.",
};

export default function ResourcesPage() {
    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            {/* Accessible Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
                <ol className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <li>
                        <Link href="/" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                            Home
                        </Link>
                    </li>
                    <li>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    </li>
                    <li className="font-semibold text-zinc-900 dark:text-zinc-100" aria-current="page">
                        Resources &amp; Student Benefits
                    </li>
                </ol>
            </nav>

            <StudentBenefitsCatalog />
        </main>
    );
}
