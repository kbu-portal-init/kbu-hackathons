import { listAnnouncements } from "@/actions/management/announcements";
import { AnnouncementManagement } from "./_components/announcement-management";

type searchParams = {
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
};

export default async function PanelAnnouncementsPage({ searchParams }: { searchParams: Promise<searchParams> }) {
    const params = await searchParams;

    const result = await listAnnouncements({
        page: params.page ?? "1",
        pageSize: params.pageSize ?? "10",
        search: params.search,
        status: params.status,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-zinc-500">Management workspace</p>
                <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
                <p className="mt-1 text-sm text-zinc-500">Create, publish, and manage platform announcements.</p>
            </div>

            <AnnouncementManagement items={result.data.items} meta={result.data.meta} />
        </div>
    );
}
