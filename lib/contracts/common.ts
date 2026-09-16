export type ActionError = {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

export type DataResult<T> = { data: T };

export type PaginationMeta = {
    total: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
};

export type ListResult<T> = {
    items: T[];
    meta: PaginationMeta;
};

export type ListActionResult<T> = ActionResult<ListResult<T>>;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type PageInput = { page?: number; pageSize?: number };
