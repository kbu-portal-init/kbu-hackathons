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
            className="flex flex-1 items-center justify-center bg-orange-50/60 px-6 py-16"
            role="status"
            aria-label="Loading password reset"
        >
            <span className="sr-only">Loading password reset</span>
            <div className="w-full max-w-md">
                <Skeleton className="mb-8 h-4 w-44 bg-zinc-100" />
                <div className="rounded-2xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/40">
                    <Skeleton className="size-11 rounded-xl bg-orange-100" />
                    <Skeleton className="mt-6 h-3 w-40 bg-orange-100" />
                    <Skeleton className="mt-3 h-8 w-3/4 bg-zinc-100" />
                    <div className="mt-6 space-y-4">
                        <Skeleton className="h-11 w-full bg-zinc-100" />
                        <Skeleton className="h-11 w-full bg-zinc-100" />
                    </div>
                    <Skeleton className="mt-6 h-11 w-full rounded-lg bg-orange-100" />
                </div>
            </div>
        </main>
    );
}
