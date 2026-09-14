import { LoginPage } from "@/components/login-page";

export default function ManagementLoginPage() {
    return (
        <LoginPage
            audience="management"
            title="Management panel"
            description="Sign in to manage events, registrations, announcements, and community updates."
        />
    );
}
