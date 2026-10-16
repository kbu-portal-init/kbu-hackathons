import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getStudentBenefits, studentBenefits } from "@/lib/public-data/student-benefits";
import { StudentBenefitDetail } from "./_components/student-benefit-detail";

export async function generateStaticParams() {
    return studentBenefits.map((benefit) => ({
        id: benefit.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const locale = await getLocale();
    const t = getMessages(locale).resourcesPage;
    const benefit = getStudentBenefits(locale).find((b) => b.id === id);

    if (!benefit) {
        return {
            title: t.notFoundTitle,
        };
    }

    return {
        title: t.claimGuideTitle(benefit.title),
        description: benefit.description,
    };
}

export default async function StudentBenefitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <StudentBenefitDetail id={id} />;
}
