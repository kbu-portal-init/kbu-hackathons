"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaginationFooter } from "@/components/pagination-footer";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/contracts/common";
import type { TeamListItem } from "@/lib/contracts/teams";
import { formatRole } from "@/lib/util";
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
            <div className="flex flex-wrap gap-2">
                {filters.map((value) => (
                    <Button
                        key={value}
                        size="sm"
                        variant={filter === value ? "default" : "outline"}
                        className={
                            filter === value
                                ? "rounded-none border-2 border-brand-ink bg-brand-ink font-display text-xs font-semibold text-brand-paper hover:bg-brand-ink"
                                : "rounded-none border-2 border-brand-ink/20 font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow"
                        }
                        onClick={() => changeFilter(value)}
                    >
                        {value[0] + value.slice(1).toLowerCase()}
                    </Button>
                ))}
            </div>
            <div className="rounded-none border-2 border-brand-ink bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Team
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Program
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Login
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Members
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Submission
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Created
                            </TableHead>
                            <TableHead className="text-right font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-brand-muted-foreground">
                                    No approved teams found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow className="hover:bg-brand-yellow/20" key={item.id}>
                                    <TableCell className="font-medium">{item.displayName}</TableCell>
                                    <TableCell>{formatRole(item.program)}</TableCell>
                                    <TableCell>{item.loginName}</TableCell>
                                    <TableCell>{item.memberCount}</TableCell>
                                    <TableCell>
                                        {item.submissionCount > 0 ? (
                                            <Badge className="rounded-none border-2 border-brand-ink bg-brand-yellow text-brand-ink">
                                                Submitted
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-none border-2 border-brand-ink/15 text-brand-muted-foreground"
                                            >
                                                Not submitted
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.banned ? (
                                            <Badge
                                                variant="destructive"
                                                className="rounded-none border-2 border-destructive/40"
                                            >
                                                Banned
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="rounded-none border-2 border-brand-ink text-brand-ink"
                                            >
                                                Active
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/panel/teams/${item.id}`}
                                                className={buttonVariants({
                                                    variant: "outline",
                                                    size: "sm",
                                                    className:
                                                        "rounded-none border-2 border-brand-ink font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow hover:text-brand-ink",
                                                })}
                                            >
                                                View
                                            </Link>
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
