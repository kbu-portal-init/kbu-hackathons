import type { SendNotificationInput } from "@/lib/contracts/notifications";

type SubmissionResult =
    | { ok: true; data: { emailRecipientCount: number; inAppRecipientCount: number } }
    | { ok: false; error: { message: string } };

export async function submitNotification(
    action: (input: SendNotificationInput) => Promise<SubmissionResult>,
    input: SendNotificationInput,
    setMessage: (message: string) => void,
    setPending: (pending: boolean) => void,
) {
    setPending(true);
    try {
        const result = await action(input);
        setMessage(
            result.ok
                ? `Sent to ${result.data.emailRecipientCount} email recipient(s) and ${result.data.inAppRecipientCount} team inbox(es).`
                : result.error.message,
        );
        return result;
    } catch {
        setMessage("The notification could not be sent. Please try again.");
        return null;
    } finally {
        setPending(false);
    }
}
