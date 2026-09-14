import { LoginPage } from "@/components/login-page";

export default function ParticipantLoginPage() {
    return (
        <LoginPage
            audience="participant"
            title="Welcome back, builder"
            description="Sign in to access your approved team workspace and participate in KBU hackathons."
        />
    );
}
