import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

export default async function ParticipantLoginPage() {
    await redirectHomeIfAlreadyAuthenticated();
    return (
        <LoginContent
            audience="participant"
            title="Welcome back, builder"
            description="Enter your verified leader email to receive a magic link and access your team workspace."
        />
    );
}
