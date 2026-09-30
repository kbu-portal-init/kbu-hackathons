import { toast } from "sonner";

export function handleActionError(error: unknown, message: string): false {
    console.error(error);
    toast.error(message);
    return false;
}
