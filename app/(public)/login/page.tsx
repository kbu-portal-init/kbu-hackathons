import { Suspense } from "react";
import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { Skeleton } from "@/components/ui/skeleton";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/server";

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginRedirect />
        </Suspense>
    );
}

async function LoginRedirect() {
    await redirectAuthenticatedUser();
    return <LoginContent locale={await getLocale()} />;
}

function LoginFallback() {
    return (
        <main
            className="flex flex-1 items-center bg-background px-5 py-16 sm:px-8"
            role="status"
            aria-label="Loading sign in"
        >
            <span className="sr-only">Loading sign in</span>
            <section className="mx-auto w-full max-w-lg border-2 border-border bg-card">
                <div className="border-b-2 border-border bg-accent text-accent-foreground px-6 py-5 sm:px-8">
                    <Skeleton className="h-3 w-32 bg-foreground/20" />
                    <Skeleton className="mt-3 h-10 w-64 max-w-full bg-foreground/20" />
                </div>
                <div className="p-6 sm:p-8">
                    <Skeleton className="h-11 w-full bg-foreground/10" />
                    <div className="mt-8 space-y-4">
                        <Skeleton className="h-11 w-full bg-foreground/10" />
                        <Skeleton className="h-11 w-full bg-foreground/10" />
                    </div>
                    <Skeleton className="mt-6 h-11 w-full bg-primary/20" />
                </div>
            </section>
        </main>
    );
}
