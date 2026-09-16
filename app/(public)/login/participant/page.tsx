import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

export default async function ParticipantLoginPage() {
    await redirectHomeIfAlreadyAuthenticated();
    return (
        <LoginContent
            audience="participant"
            title="Welcome back, builder"
            description="Sign in to access your approved team workspace and participate in KBU hackathons."
        />
    );
}
