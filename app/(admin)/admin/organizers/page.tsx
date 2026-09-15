import { requireAdmin } from "@/actions/auth";
import { OrganizerTable } from "@/components/organizer-table";
import prisma from "@/lib/prisma";

export default async function AdminOrganizersPage() {
    await requireAdmin();

    const organizers = await prisma.user.findMany({
        where: { role: "organizer" },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                    Administrator workspace
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight">Organizers</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage organizer accounts and elevated access.</p>
            </div>

            <OrganizerTable organizers={organizers} />
        </div>
    );
}
