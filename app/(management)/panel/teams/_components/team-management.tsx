"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaginationFooter } from "@/components/pagination-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/contracts/common";
import type { TeamListItem } from "@/lib/contracts/teams";
import { TeamActions } from "./team-actions";

type Props = { items: TeamListItem[]; meta: PaginationMeta; status?: "ACTIVE" | "BANNED" };
const filters = ["ALL", "ACTIVE", "BANNED"] as const;

export function TeamManagement({ items, meta, status }: Props) {
    const router = useRouter();
    const [filter, setFilter] = useState<(typeof filters)[number]>(status ?? "ALL");
    const changeFilter = (next: (typeof filters)[number]) => {
        setFilter(next);
        const params = new URLSearchParams({ page: "1", pageSize: String(meta.pageSize) });
        if (next !== "ALL") params.set("status", next);
        router.push(`/panel/teams?${params}`);
    };
    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-zinc-500">Management workspace</p>
                <h1 className="text-2xl font-semibold tracking-tight">All teams</h1>
                <p className="mt-1 text-sm text-zinc-500">Browse approved teams and monitor their submissions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map((value) => (
                    <Button
                        key={value}
                        size="sm"
                        variant={filter === value ? "default" : "outline"}
                        onClick={() => changeFilter(value)}
                    >
                        {value[0] + value.slice(1).toLowerCase()}
                    </Button>
                ))}
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team</TableHead>
                            <TableHead>Login</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Submission</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    No approved teams found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.displayName}</TableCell>
                                    <TableCell>{item.loginName}</TableCell>
                                    <TableCell>{item.memberCount}</TableCell>
                                    <TableCell>
                                        {item.submissionCount > 0 ? (
                                            <Badge>Submitted</Badge>
                                        ) : (
                                            <Badge variant="secondary">Not submitted</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.banned ? (
                                            <Badge variant="destructive">Banned</Badge>
                                        ) : (
                                            <Badge variant="outline">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                render={<Link href={`/panel/teams/${item.id}`} />}
                                            >
                                                View
                                            </Button>
                                            <TeamActions team={item} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <PaginationFooter
                page={meta.page}
                pageSize={meta.pageSize}
                total={meta.total}
                itemsShown={items.length}
                hasNextPage={meta.hasNextPage}
                getPageHref={(page) => {
                    const params = new URLSearchParams({ page: String(page), pageSize: String(meta.pageSize) });
                    if (filter !== "ALL") params.set("status", filter);
                    return `/panel/teams?${params}`;
                }}
            />
        </div>
    );
}
