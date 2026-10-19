"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AnnouncementSearchProps = {
    defaultValue?: string;
    category?: string;
    labels: {
        search: string;
        searchButton: string;
        closeSearch: string;
    };
};

export function AnnouncementSearch({ defaultValue = "", category = "all", labels }: AnnouncementSearchProps) {
    const [search, setSearch] = useState(defaultValue);

    return (
        <div className="w-full min-w-0">
            <search>
                <form action="/announcements" method="get" className="flex w-full min-w-0 items-center gap-2">
                    {category !== "all" && <input type="hidden" name="category" value={category} />}

                    <div className="relative min-w-0 flex-1">
                        <Search
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            type="search"
                            name="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={labels.search}
                            aria-label={labels.search}
                            maxLength={100}
                            className="h-11 w-full min-w-0 border-2 border-border/25 bg-card pl-9 pr-11 text-sm appearance-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 [&::-webkit-search-cancel-button]:appearance-none"
                        />

                        {search && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                aria-label={labels.closeSearch}
                                onClick={() => setSearch("")}
                                className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 border-2 border-border bg-foreground text-background hover:bg-accent hover:text-accent-foreground"
                            >
                                <X className="size-4" strokeWidth={2.25} aria-hidden="true" />
                            </Button>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="h-11 shrink-0 border-2 border-border bg-foreground px-4 font-display text-sm font-semibold text-background hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-6"
                    >
                        {labels.searchButton}
                    </Button>
                </form>
            </search>
        </div>
    );
}
