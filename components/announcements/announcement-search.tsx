"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AnnouncementSearchProps = {
    defaultValue?: string;
    category?: string;
    labels: {
        search: string;
        searchButton: string;
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
                            className="h-11 w-full min-w-0 rounded-xl border-orange-200 bg-white pl-9 text-sm"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-11 shrink-0 rounded-xl bg-orange-600 px-3 text-white hover:bg-orange-700 sm:px-6"
                    >
                        {labels.searchButton}
                    </Button>
                </form>
            </search>
        </div>
    );
}
