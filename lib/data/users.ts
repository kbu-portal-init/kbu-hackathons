import "server-only";
import type { ListUsersInput, UserDirectoryResult } from "@/lib/contracts/users";
import prisma from "@/lib/prisma";

export async function listUsers(input: ListUsersInput): Promise<UserDirectoryResult> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 200;
    const search = input.search?.trim();
    const userWhere = search
        ? {
              OR: [
                  { id: search },
                  { name: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
              ],
          }
        : {};
    const memberWhere = search
        ? {
              OR: [
                  { id: search },
                  { name: { contains: search, mode: "insensitive" as const } },
                  { studentEmail: { contains: search, mode: "insensitive" as const } },
              ],
          }
        : {};
    const [users, members] = await Promise.all([
        prisma.user.findMany({
            where: userWhere,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            select: { id: true, name: true, email: true },
        }),
        prisma.teamMember.findMany({
            where: memberWhere,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            select: { id: true, name: true, studentEmail: true },
        }),
    ]);
    const items = [
        ...users.map((user) => ({ ...user, kind: "user" as const })),
        ...members.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.studentEmail,
            kind: "teamMember" as const,
        })),
    ].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const total = items.length;
    return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
}
