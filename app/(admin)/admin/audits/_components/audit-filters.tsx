"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PosterButton, PosterInput } from "@/components/poster";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type AuditAction, auditActions } from "@/lib/contracts/audits";
import type { UserDirectoryItem, UserDirectoryResult } from "@/lib/contracts/users";

type Props = { userId?: string; userKind?: "user" | "teamMember"; action?: AuditAction };

async function fetchUsers(page: number, pageSize: number, search: string): Promise<UserDirectoryResult> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    const response = await fetch(`/api/admin/users?${params}`);
    if (!response.ok) throw new Error("Unable to load users");
    return response.json() as Promise<UserDirectoryResult>;
}

export function AuditFilters({ userId, userKind, action }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(200);
    const [users, setUsers] = useState<UserDirectoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<UserDirectoryItem>();
    useEffect(() => {
        if (!open) return;
        const timeoutId = window.setTimeout(() => {
            setLoading(true);
            fetchUsers(1, limit, search)
                .then((result) => {
                    setUsers(result.items);
                    setPage(result.meta.page);
                    setHasNext(result.meta.hasNextPage);
                })
                .catch(() => {
                    setUsers([]);
                    setHasNext(false);
                })
                .finally(() => setLoading(false));
        }, 300);
        return () => window.clearTimeout(timeoutId);
    }, [open, limit, search]);
    async function loadMore() {
        setLoading(true);
        try {
            const result = await fetchUsers(page + 1, limit, search);
            setUsers((current) => [...current, ...result.items]);
            setPage(result.meta.page);
            setHasNext(result.meta.hasNextPage);
        } finally {
            setLoading(false);
        }
    }
    function applyFilters(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const query = new URLSearchParams({ page: "1", pageSize: "20" });
        const actionValue = String(form.get("action") ?? "").trim();
        if (selected || (userId && userKind)) {
            query.set("userId", selected?.id ?? userId ?? "");
            query.set("userKind", selected?.kind ?? userKind ?? "user");
        }
        if (actionValue) query.set("action", actionValue);
        router.push(`${pathname}?${query}`);
    }
    function clear() {
        setSelected(undefined);
        setSearch("");
        setLimit(200);
        router.push(pathname);
    }
    return (
        <form
            onSubmit={applyFilters}
            className="grid gap-4 border-2 border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
            <div className="space-y-2">
                <Label className="font-display text-sm font-semibold text-foreground">User</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        render={
                            <PosterButton
                                tone="outline"
                                type="button"
                                className="h-9 w-full justify-start border-2 border-border/25 bg-card font-normal text-foreground"
                            />
                        }
                    >
                        {selected
                            ? `${selected.name} · ${selected.email}`
                            : userId
                              ? `${userKind === "teamMember" ? "Team member" : "User"} · ${userId}`
                              : "Select a user or team member"}
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(28rem,calc(100vw-2rem))]" align="start">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="user-search"
                                    className="font-display text-sm font-semibold text-foreground"
                                >
                                    Search users
                                </Label>
                                <PosterInput
                                    id="user-search"
                                    className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="ID, name, or email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="user-limit"
                                    className="font-display text-sm font-semibold text-foreground"
                                >
                                    Limit
                                </Label>
                                <PosterInput
                                    id="user-limit"
                                    type="number"
                                    min={1}
                                    max={500}
                                    className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={limit}
                                    onChange={(event) =>
                                        setLimit(Math.min(500, Math.max(1, Number(event.target.value) || 1)))
                                    }
                                />
                            </div>
                            <div className="max-h-64 space-y-1 overflow-y-auto">
                                {users.map((item) => (
                                    <button
                                        type="button"
                                        key={`${item.kind}:${item.id}`}
                                        className="block w-full p-2 text-left hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            setSelected(item);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="font-medium">
                                            {item.name}{" "}
                                            <span className="text-xs text-muted-foreground">
                                                {item.kind === "teamMember" ? "Team member" : "User"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.email} · {item.id}
                                        </div>
                                    </button>
                                ))}
                                {!loading && users.length === 0 && (
                                    <p className="p-2 text-sm text-muted-foreground">No users found.</p>
                                )}
                                {loading && <p className="p-2 text-sm text-muted-foreground">Loading...</p>}
                            </div>
                            {hasNext && (
                                <PosterButton
                                    tone="outline"
                                    type="button"
                                    className="w-full"
                                    disabled={loading}
                                    onClick={() => void loadMore()}
                                >
                                    Load more
                                </PosterButton>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="action" className="font-display text-sm font-semibold text-foreground">
                    Audit log type
                </Label>
                <select
                    id="action"
                    name="action"
                    defaultValue={action ?? ""}
                    className="flex h-9 w-full border-2 border-border/25 bg-card px-3 text-sm outline-none focus:border-primary"
                >
                    <option value="">All audit types</option>
                    {auditActions.map((auditAction) => (
                        <option key={auditAction} value={auditAction}>
                            {auditAction.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex gap-2">
                <PosterButton
                    tone="solid"
                    type="submit"
                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                >
                    Filter
                </PosterButton>
                <PosterButton
                    tone="outline"
                    type="button"
                    className="border-2 border-border font-display text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={clear}
                >
                    Clear
                </PosterButton>
            </div>
        </form>
    );
}
