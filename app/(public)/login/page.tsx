import { Suspense } from "react";
import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { Skeleton } from "@/components/ui/skeleton";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginRedirect />
        </Suspense>
    );
}

async function LoginRedirect() {
    await redirectHomeIfAlreadyAuthenticated();
    return <LoginContent />;
}

function LoginFallback() {
    return (
        <main
            className="flex flex-1 items-center bg-orange-50/60 px-6 py-16"
            role="status"
            aria-label="Loading sign in"
        >
            <span className="sr-only">Loading sign in</span>
            <section className="mx-auto w-full max-w-md">
                <Skeleton className="h-8 w-64 max-w-full bg-zinc-100" />
                <Skeleton className="mt-6 h-10 w-full rounded-xl bg-zinc-100" />
                <div className="mt-8 space-y-4">
                    <Skeleton className="h-11 w-full bg-zinc-100" />
                    <Skeleton className="h-11 w-full bg-zinc-100" />
                </div>
                <Skeleton className="mt-6 h-11 w-full rounded-lg bg-orange-100" />
            </section>
        </main>
    );
}
