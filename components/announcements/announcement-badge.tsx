import { cn } from "cn";
import { CircleAlert, FileText, Megaphone } from "lucide-react";

type AnnouncementCategory = "important" | "update" | "news";

type Props = {
    category: AnnouncementCategory;
    className?: string;
};

const categoryStyles = {
    important: {
        label: "Important",
        className: "border-border bg-accent text-accent-foreground",
        Icon: CircleAlert,
    },
    update: {
        label: "Update",
        className: "border-border bg-secondary text-secondary-foreground",
        Icon: FileText,
    },
    news: {
        label: "News",
        className: "border-border bg-card text-foreground",
        Icon: Megaphone,
    },
} satisfies Record<
    AnnouncementCategory,
    {
        label: string;
        className: string;
        Icon: typeof Megaphone;
    }
>;

export function AnnouncementCategoryBadge({ category, className }: Props) {
    const item = categoryStyles[category];
    const Icon = item.Icon;

    return (
        <span
            className={cn(
                "inline-flex w-fit shrink-0 items-center gap-1.5 border-2 px-2.5 py-1 font-display text-xs font-semibold",
                item.className,
                className,
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            {item.label}
        </span>
    );
}
