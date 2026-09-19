import { z } from "zod";
import type { ListResult } from "@/lib/contracts/common";

export const listUsersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(200),
    search: z.string().trim().max(320).optional(),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UserDirectoryItem = { id: string; name: string; email: string; kind: "user" | "teamMember" };
export type UserDirectoryResult = ListResult<UserDirectoryItem>;
