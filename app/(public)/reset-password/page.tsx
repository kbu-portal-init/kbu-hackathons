import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordForm } from "./_components/reset-password-form";

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string }>;
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            {searchParams.then(({ token }) => (
                <ResetPasswordForm token={token ?? ""} />
            ))}
        </Suspense>
    );
}

function ResetPasswordFallback() {
    return (
        <main
            className="flex flex-1 items-center justify-center bg-brand-paper px-5 py-16 sm:px-8"
            role="status"
            aria-label="Loading password reset"
        >
            <span className="sr-only">Loading password reset</span>
            <div className="w-full max-w-md">
                <Skeleton className="mb-8 h-4 w-44 rounded-none bg-brand-ink/10" />
                <div className="border-2 border-brand-ink bg-card p-7 sm:p-8">
                    <Skeleton className="size-11 rounded-none bg-primary/20" />
                    <Skeleton className="mt-6 h-3 w-40 rounded-none bg-brand-ink/10" />
                    <Skeleton className="mt-3 h-8 w-3/4 rounded-none bg-brand-ink/10" />
                    <div className="mt-6 space-y-4">
                        <Skeleton className="h-11 w-full rounded-none bg-brand-ink/10" />
                        <Skeleton className="h-11 w-full rounded-none bg-brand-ink/10" />
                    </div>
                    <Skeleton className="mt-6 h-11 w-full rounded-none bg-primary/20" />
                </div>
            </div>
        </main>
    );
}
