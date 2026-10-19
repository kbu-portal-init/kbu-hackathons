"use client";

import { ChevronsUpDown, LogOut, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { clearSessionHint } from "@/lib/auth/session-hint";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
    adminDashboardLinks,
    isActivePath,
    managementDashboardLinks,
    participantDashboardLinks,
} from "@/lib/navigation";
import { ConfirmActionAlertDialog } from "./confirm-action-alert-dialog";

type DashboardSidebarProps = {
    area: "participant" | "management" | "admin";
    locale: Locale;
    lineContact: { url: string; name: string };
    children: ReactNode;
    role: "admin" | "organizer" | "team" | null;
    account: {
        name: string;
        email: string;
        identifier: string;
        image: string | null;
    };
};

export function DashboardSidebar({ area, locale, lineContact, children, role, account }: DashboardSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const t = getMessages(locale).dashboard;

    const config = {
        participant: {
            label: t.team,
            title: t.teamTitle,
            links: participantDashboardLinks,
        },
        management: {
            label: t.management,
            title: t.management,
            links: managementDashboardLinks,
        },
        admin: {
            label: t.admin,
            title: t.adminTitle,
            links: adminDashboardLinks,
        },
    } as const;

    const { label: sidebarLabel, title: headerTitle, links } = config[area];
    const localizedLinks = t.links[area === "participant" ? "team" : area];
    const adminActive = isActivePath(pathname, "/admin");

    return (
        <SidebarProvider className="min-h-screen flex-1">
            <DashboardSidebarRouteReset />
            <Sidebar collapsible="icon" className="border-r-2 border-border bg-background">
                <SidebarHeader>
                    <Link
                        href="/"
                        aria-label="KBU Hackathon 2026 home"
                        className="flex items-center gap-2 px-2 py-2 font-display font-semibold text-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    >
                        <Image src="/images/logo-trans.svg" alt="" width={28} height={28} className="size-7 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">KBU Hackathon 2026</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {sidebarLabel}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {links.map(({ href, label, icon: Icon }) => {
                                    const localizedLabel = localizedLinks[href as keyof typeof localizedLinks] ?? label;
                                    const active = isActivePath(pathname, href);
                                    return (
                                        <SidebarMenuItem key={href}>
                                            <SidebarMenuButton
                                                render={<Link href={href} aria-current={active ? "page" : undefined} />}
                                                tooltip={localizedLabel}
                                                isActive={active}
                                                className="font-display text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground data-active:bg-accent data-active:text-accent-foreground"
                                            >
                                                <Icon />
                                                <span>{localizedLabel}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                                {/* Only shown when the user is in the management area and has the admin role */}
                                {area === "management" && role === "admin" && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            render={
                                                <Link href="/admin" aria-current={adminActive ? "page" : undefined} />
                                            }
                                            tooltip={t.adminPanel}
                                            isActive={adminActive}
                                            className="font-display text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground data-active:bg-accent data-active:text-accent-foreground"
                                        >
                                            <ShieldCheck />
                                            <span>{t.adminPanel}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <AccountFooter
                        account={account}
                        locale={locale}
                        onSignOut={async () => {
                            await authClient.signOut();
                            clearSessionHint();
                            router.push("/");
                        }}
                    />
                </SidebarFooter>
            </Sidebar>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 items-center gap-3 border-b-2 border-border/15 bg-background px-4">
                    <SidebarTrigger className="size-11 border-2 border-border/15 hover:bg-accent hover:text-accent-foreground md:size-8" />
                    <p className="font-display text-sm font-semibold text-foreground">{headerTitle}</p>
                    <div className="ml-auto">
                        <LanguageSwitcher locale={locale} />
                    </div>
                </header>
                {children}
                <footer className="border-t-2 border-border/15 bg-background px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="font-display font-semibold text-foreground">{t.needHelp}</span>
                        {lineContact.url ? (
                            <a
                                className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:text-foreground"
                                href={lineContact.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {lineContact.name || "LINE"}
                            </a>
                        ) : null}
                        <Link
                            className="text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:text-foreground"
                            href="/announcements"
                        >
                            {t.announcements}
                        </Link>
                    </div>
                </footer>
            </div>
        </SidebarProvider>
    );
}

function AccountFooter({
    account,
    locale,
    onSignOut,
}: {
    account: DashboardSidebarProps["account"];
    locale: Locale;
    onSignOut: () => Promise<void>;
}) {
    const t = getMessages(locale).dashboard;
    const initials = account.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const avatar = account.image ? (
        <Image
            src={account.image}
            alt=""
            width={32}
            height={32}
            className="size-8 border-2 border-border object-cover"
        />
    ) : (
        <span className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-accent font-display text-xs font-bold text-accent-foreground">
            {initials || "?"}
        </span>
    );

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 p-1.5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-foreground group-data-[collapsible=icon]:justify-center"
                        aria-label={`${t.openAccount} ${account.name}`}
                    />
                }
            >
                {avatar}
                <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="block truncate font-display text-sm font-semibold text-foreground">
                        {account.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{account.identifier}</span>
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-foreground/60 group-data-[collapsible=icon]:hidden" />
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 border-2 border-border">
                <PopoverHeader>
                    <div className="flex items-center gap-3">
                        {avatar}
                        <div className="min-w-0">
                            <PopoverTitle className="truncate font-display">{account.name}</PopoverTitle>
                            <PopoverDescription className="truncate">{account.identifier}</PopoverDescription>
                        </div>
                    </div>
                </PopoverHeader>
                <ConfirmActionAlertDialog
                    trigger={
                        <button
                            type="button"
                            className="flex w-full cursor-pointer items-center gap-2 border-2 border-border bg-foreground px-2 py-2 font-display text-sm font-semibold text-background outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground"
                        >
                            <LogOut className="size-4" />
                            <span>{t.signOut}</span>
                        </button>
                    }
                    title={t.signOutQuestion}
                    description={t.signOutDescription}
                    confirmLabel={t.signOut}
                    pendingLabel={t.signingOut}
                    onConfirm={onSignOut}
                />
            </PopoverContent>
        </Popover>
    );
}

function DashboardSidebarRouteReset() {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    useEffect(() => {
        if (pathname) {
            setOpenMobile(false);
        }
    }, [pathname, setOpenMobile]);

    return null;
}
