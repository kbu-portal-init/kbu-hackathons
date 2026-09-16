import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ActionError } from "@/lib/contracts/common";

export function applyActionFieldErrors<TFieldValues extends FieldValues>(
    fieldErrors: ActionError["fieldErrors"],
    setError: UseFormSetError<TFieldValues>,
    fieldAliases: Partial<Record<string, Path<TFieldValues>>> = {},
) {
    Object.entries(fieldErrors ?? {}).forEach(([field, messages]) => {
        const fieldName = fieldAliases[field] ?? (field as Path<TFieldValues>);
        setError(fieldName, { type: "server", message: messages[0] });
    });
}
