import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

export default async function ManagementLoginPage() {
    await redirectHomeIfAlreadyAuthenticated();
    return (
        <LoginContent
            audience="management"
            title="Management panel"
            description="Sign in to manage events, registrations, announcements, and community updates."
        />
    );
}
