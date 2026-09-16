import type { ZodError } from "zod";

export function toFieldErrors(error: Pick<ZodError, "issues">): Record<string, string[]> {
    return error.issues.reduce<Record<string, string[]>>((fieldErrors, issue) => {
        const field = issue.path.join(".") || "root";
        const messages = fieldErrors[field] ?? [];

        if (!messages.includes(issue.message)) messages.push(issue.message);
        fieldErrors[field] = messages;
        return fieldErrors;
    }, {});
}
