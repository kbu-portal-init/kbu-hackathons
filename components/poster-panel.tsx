import { cn } from "cn";
import type { ComponentProps } from "react";

export function PosterPanel({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("border-2 border-brand-ink bg-card", className)} {...props} />;
}
