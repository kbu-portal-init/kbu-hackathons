import { LoginContent } from "@/app/(public)/login/_components/login-content";

export default function ManagementLoginPage() {
    return (
        <LoginContent
            audience="management"
            title="Management panel"
            description="Sign in to manage events, registrations, announcements, and community updates."
        />
    );
}
