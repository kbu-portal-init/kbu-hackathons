import { ResetPasswordForm } from "@/app/(public)/reset-password/_components/reset-password-form";

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;
    return <ResetPasswordForm token={token ?? ""} />;
}
