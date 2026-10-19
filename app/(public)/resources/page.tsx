import type { Metadata } from "next";
import { PosterBreadcrumb } from "@/components/poster-breadcrumb";
import { StudentBenefitsCatalog } from "@/components/resources/student-benefits-catalog";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = getMessages(await getLocale()).resourcesPage;
    return {
        title: t.metaTitle,
        description: t.metaDescription,
    };
}

export default async function ResourcesPage() {
    const locale = await getLocale();
    const messages = getMessages(locale);

    return (
        <main className="flex-1 bg-background">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
                <PosterBreadcrumb
                    items={[{ label: messages.common.home, href: "/" }, { label: messages.resourcesPage.title }]}
                    className="mb-8"
                />
                <StudentBenefitsCatalog locale={locale} />
            </div>
        </main>
    );
}
