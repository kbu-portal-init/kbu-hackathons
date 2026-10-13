import { cn } from "cn";
import { FileText, Megaphone, Star } from "lucide-react";

type AnnouncementCategory = "important" | "update" | "news";

type Props = {
    category: AnnouncementCategory;
    className?: string;
};

const categoryStyles = {
    important: {
        label: "Important",
        className: "border-orange-200 bg-orange-50 text-orange-600",
        Icon: Star,
    },
    update: {
        label: "Update",
        className: "border-blue-200 bg-blue-50 text-blue-600",
        Icon: FileText,
    },
    news: {
        label: "News",
        className: "border-emerald-200 bg-emerald-50 text-emerald-600",
        Icon: Megaphone,
    },
} satisfies Record<
    AnnouncementCategory,
    {
        label: string;
        className: string;
        Icon: typeof Star;
    }
>;

export function AnnouncementCategoryBadge({ category, className }: Props) {
    const item = categoryStyles[category];
    const Icon = item.Icon;

    return (
        <span
            className={cn(
                "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                item.className,
                className,
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            {item.label}
        </span>
    );
}
