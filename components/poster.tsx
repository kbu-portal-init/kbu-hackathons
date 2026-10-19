import { cn } from "cn";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectTrigger } from "@/components/ui/select";
import { TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export type PosterButtonTone = "solid" | "brand" | "outline" | "destructive" | "ghost" | "link";

const buttonToneClasses: Record<PosterButtonTone, string> = {
    solid: "border-2 border-border bg-foreground font-display font-semibold text-background hover:bg-accent hover:text-accent-foreground",
    brand: "border-2 border-primary bg-primary font-display font-semibold text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground",
    outline:
        "border-2 border-border bg-background font-display font-semibold text-foreground hover:bg-accent hover:text-accent-foreground",
    destructive: "border-2 border-destructive/40 font-display font-semibold",
    ghost: "",
    link: "",
};

const buttonVariant = {
    solid: "default",
    brand: "default",
    outline: "outline",
    destructive: "destructive",
    ghost: "ghost",
    link: "link",
} as const;

export function PosterButton({
    tone = "solid",
    className,
    ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & { tone?: PosterButtonTone }) {
    const resolvedClassName =
        typeof className === "function"
            ? (state: Parameters<typeof className>[0]) => cn(buttonToneClasses[tone], className(state))
            : cn(buttonToneClasses[tone], className);

    return <Button variant={buttonVariant[tone]} className={resolvedClassName} {...props} />;
}

export type PosterBadgeTone = "neutral" | "accent" | "danger" | "muted" | "primary";

const badgeTones = {
    neutral: { variant: "outline", className: "border-2 border-border text-foreground" },
    accent: { variant: "outline", className: "border-2 border-border bg-accent text-accent-foreground" },
    danger: { variant: "destructive", className: "border-2 border-destructive/40" },
    muted: { variant: "secondary", className: "border-2 border-border/15 text-muted-foreground" },
    primary: { variant: "default", className: "border-2 border-border" },
} as const;

export function PosterBadge({
    tone = "neutral",
    className,
    ...props
}: Omit<ComponentProps<typeof Badge>, "variant"> & { tone?: PosterBadgeTone }) {
    return (
        <Badge variant={badgeTones[tone].variant} className={cn(badgeTones[tone].className, className)} {...props} />
    );
}

const fieldClasses =
    "border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

export function PosterInput({ className, ...props }: ComponentProps<typeof Input>) {
    return <Input className={cn("h-11", fieldClasses, className)} {...props} />;
}

export function PosterTextarea({ className, ...props }: ComponentProps<typeof Textarea>) {
    return <Textarea className={cn(fieldClasses, className)} {...props} />;
}

export function PosterSelectTrigger({ className, ...props }: ComponentProps<typeof SelectTrigger>) {
    return <SelectTrigger className={cn("h-11 w-full", fieldClasses, className)} {...props} />;
}

export function PosterFieldLabel({ className, ...props }: ComponentProps<typeof FieldLabel>) {
    return <FieldLabel className={cn("font-display text-sm font-semibold text-foreground", className)} {...props} />;
}

export function PosterTableHead({ className, ...props }: ComponentProps<typeof TableHead>) {
    return (
        <TableHead
            className={cn(
                "font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

export function PosterDialogContent({ className, ...props }: ComponentProps<typeof DialogContent>) {
    return <DialogContent className={cn("border-2 border-border bg-card ring-0", className)} {...props} />;
}

export function PosterDialogFooter({ className, ...props }: ComponentProps<typeof DialogFooter>) {
    return (
        <DialogFooter
            className={cn(
                "-mx-4 -mb-4 border-t-2 border-border/15 bg-transparent p-4 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    );
}

export { PosterPanel } from "@/components/poster-panel";
