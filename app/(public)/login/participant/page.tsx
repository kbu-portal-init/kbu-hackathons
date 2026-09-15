import { LoginContent } from "@/app/(public)/login/_components/login-content";

export default function ParticipantLoginPage() {
    return (
        <LoginContent
            audience="participant"
            title="Welcome back, builder"
            description="Sign in to access your approved team workspace and participate in KBU hackathons."
        />
    );
}
