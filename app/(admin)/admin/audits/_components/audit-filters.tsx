"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
            className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="space-y-2">
                <Label>User</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        render={<Button type="button" variant="outline" className="w-full justify-start font-normal" />}
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
                                <Label htmlFor="user-search">Search users</Label>
                                <Input
                                    id="user-search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="ID, name, or email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-limit">Limit</Label>
                                <Input
                                    id="user-limit"
                                    type="number"
                                    min={1}
                                    max={500}
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
                                        className="block w-full rounded-md p-2 text-left hover:bg-orange-50"
                                        onClick={() => {
                                            setSelected(item);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="font-medium">
                                            {item.name}{" "}
                                            <span className="text-xs text-zinc-500">
                                                {item.kind === "teamMember" ? "Team member" : "User"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {item.email} · {item.id}
                                        </div>
                                    </button>
                                ))}
                                {!loading && users.length === 0 && (
                                    <p className="p-2 text-sm text-zinc-500">No users found.</p>
                                )}
                                {loading && <p className="p-2 text-sm text-zinc-500">Loading...</p>}
                            </div>
                            {hasNext && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading}
                                    onClick={() => void loadMore()}
                                >
                                    Load more
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="action">Audit log type</Label>
                <select
                    id="action"
                    name="action"
                    defaultValue={action ?? ""}
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-orange-500 dark:border-zinc-700"
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
                <Button type="submit">Filter</Button>
                <Button type="button" variant="outline" onClick={clear}>
                    Clear
                </Button>
            </div>
        </form>
    );
}
