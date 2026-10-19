"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PaginationFooter } from "@/components/pagination-footer";
import { PosterBadge, PosterButton, PosterTableHead } from "@/components/poster";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
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
                    <PosterButton
                        key={value}
                        size="sm"
                        tone={filter === value ? "solid" : "outline"}
                        className={
                            filter === value
                                ? "border-2 border-border bg-foreground font-display text-xs font-semibold text-background hover:bg-foreground"
                                : "border-2 border-border/20 font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                        onClick={() => changeFilter(value)}
                    >
                        {value[0] + value.slice(1).toLowerCase()}
                    </PosterButton>
                ))}
            </div>
            <div className="border-2 border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Team
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Program
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Login
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Members
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Submission
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Status
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Created
                            </PosterTableHead>
                            <PosterTableHead className="text-right font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Actions
                            </PosterTableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No approved teams found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow className="hover:bg-accent/20" key={item.id}>
                                    <TableCell className="font-medium">{item.displayName}</TableCell>
                                    <TableCell>{formatRole(item.program)}</TableCell>
                                    <TableCell>{item.loginName}</TableCell>
                                    <TableCell>{item.memberCount}</TableCell>
                                    <TableCell>
                                        {item.submissionCount > 0 ? (
                                            <PosterBadge
                                                tone="accent"
                                                className="border-2 border-border bg-accent text-accent-foreground"
                                            >
                                                Submitted
                                            </PosterBadge>
                                        ) : (
                                            <PosterBadge
                                                tone="muted"
                                                className="border-2 border-border/15 text-muted-foreground"
                                            >
                                                Not submitted
                                            </PosterBadge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.banned ? (
                                            <PosterBadge tone="danger" className="border-2 border-destructive/40">
                                                Banned
                                            </PosterBadge>
                                        ) : (
                                            <PosterBadge
                                                tone="neutral"
                                                className="border-2 border-border text-foreground"
                                            >
                                                Active
                                            </PosterBadge>
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
                                                        "border-2 border-border font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground",
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
