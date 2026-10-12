"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AnnouncementSearchProps = {
    defaultValue?: string;
    category?: string;
    onOpenChange?: (open: boolean) => void;
    labels: {
        search: string;
        searchButton: string;
        openSearch: string;
        closeSearch: string;
    };
};

export function AnnouncementSearch({
    defaultValue = "",
    category = "all",
    onOpenChange,
    labels,
}: AnnouncementSearchProps) {
    const [isOpen, setIsOpen] = useState(Boolean(defaultValue));
    const [search, setSearch] = useState(defaultValue);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    function openSearch() {
        setIsOpen(true);
        onOpenChange?.(true);
    }

    function closeSearch() {
        setIsOpen(false);
        setSearch("");
        onOpenChange?.(false);
    }

    return (
        <div className="w-full min-w-0">
            {/* Mobile: collapsed search icon */}
            {!isOpen && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={labels.openSearch}
                    onClick={openSearch}
                    className="size-11 shrink-0 rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 sm:hidden"
                >
                    <Search className="size-5" aria-hidden="true" />
                </Button>
            )}

            {/* Desktop: always visible. Mobile: visible when opened. */}
            <search>
                <form
                    action="/announcements"
                    method="get"
                    className={`${isOpen ? "flex" : "hidden"} w-full min-w-0 items-center gap-2 sm:flex`}
                >
                    {category !== "all" && <input type="hidden" name="category" value={category} />}

                    <div className="relative min-w-0 flex-1">
                        <Search
                            aria-hidden="true"
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            ref={inputRef}
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

                    {/* Mobile: close and restore category buttons */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={labels.closeSearch}
                        onClick={closeSearch}
                        className="size-9 shrink-0 sm:hidden"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </Button>
                </form>
            </search>
        </div>
    );
}
