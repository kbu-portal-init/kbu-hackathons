import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationFooterProps = {
    page: number;
    pageSize: number;
    total: number;
    itemsShown: number;
    hasNextPage: boolean;
    getPageHref: (page: number) => string;
};

export function PaginationFooter({
    page,
    pageSize,
    total,
    itemsShown,
    hasNextPage,
    getPageHref,
}: PaginationFooterProps) {
    return (
        <div className="flex items-center justify-between text-sm text-zinc-500" data-page-size={pageSize}>
            <span>
                Showing {itemsShown} of {total}
            </span>
            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    {page > 1 && (
                        <PaginationItem>
                            <PaginationPrevious href={getPageHref(page - 1)} />
                        </PaginationItem>
                    )}
                    {hasNextPage && (
                        <PaginationItem>
                            <PaginationNext href={getPageHref(page + 1)} />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    );
}
