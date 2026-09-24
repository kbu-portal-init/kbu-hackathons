import { format } from "date-fns";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { getRegistrationDetail } from "@/lib/data/registrations";
import { MemberRow } from "./_components/member-row";
import { RegistrationActions } from "./_components/registration-actions";

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PENDING":
            return (
                <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                >
                    Pending
                </Badge>
            );
        case "APPROVED":
            return (
                <Badge
                    variant="outline"
                    className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                    Approved
                </Badge>
            );
        case "REJECTED":
            return <Badge variant="destructive">Rejected</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    await requireOrganizerOrAdmin();
    const { id } = await params;
    const item = await getRegistrationDetail(id);

    if (!item) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <BackButton fallbackHref="/panel/registrations" />
                <div>
                    <h1 className="text-2xl font-bold">{item.teamName}</h1>
                    <p className="text-sm text-zinc-500">{item.loginName}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <DetailField label="Leader" value={item.leaderName || "\u2014"} />
                <DetailField label="Leader email">
                    <p className="text-sm break-all">{item.leaderEmail || "\u2014"}</p>
                </DetailField>
                <DetailField label="Status">
                    <StatusBadge status={item.status} />
                </DetailField>
            </div>

            {item.applicationNotes && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Application notes</p>
                    <p className="text-sm">{item.applicationNotes}</p>
                </div>
            )}

            <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Team members ({item.members.length})</p>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Verification</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {item.members.map((m) => (
                                <MemberRow key={m.id} member={m} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {item.reviews.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500">Review history</p>
                    <div className="space-y-2">
                        {item.reviews.map((r) => (
                            <div key={r.id} className="flex items-start gap-3 text-sm">
                                <StatusBadge status={r.decision} />
                                <div>
                                    {r.reason && <p>{r.reason}</p>}
                                    <p className="text-xs text-zinc-400">
                                        {format(new Date(r.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Submitted {item.submittedAt ? format(new Date(item.submittedAt), "PPP") : "\u2014"}</span>
                <span>Created {format(new Date(item.createdAt), "PPP")}</span>
            </div>

            {item.status === "PENDING" && (
                <RegistrationActions
                    registrationId={item.id}
                    unverifiedCount={item.members.filter((m) => !m.verifiedAt).length}
                />
            )}
        </div>
    );
}

function DetailField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            {children ?? <p className="text-sm">{value}</p>}
        </div>
    );
}
