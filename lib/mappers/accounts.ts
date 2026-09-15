import type { AccountActionData } from "@/lib/contracts/accounts";

export type AccountRecord = { id: string };

export function toAccountActionData(record: AccountRecord): AccountActionData {
    return { userId: record.id };
}
