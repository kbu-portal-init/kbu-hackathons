import { LoginContent } from "@/app/(public)/login/_components/login-content";
import { redirectHomeIfAlreadyAuthenticated } from "@/lib/auth/guards";

export default async function LoginPage() {
    await redirectHomeIfAlreadyAuthenticated();
    return <LoginContent />;
}
