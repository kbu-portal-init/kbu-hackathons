"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
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
import {
    adminDashboardLinks,
    isActivePath,
    managementDashboardLinks,
    participantDashboardLinks,
} from "@/lib/navigation";
import { ConfirmActionAlertDialog } from "./confirm-action-alert-dialog";

type DashboardSidebarProps = {
    area: "participant" | "management" | "admin";
    children: ReactNode;
    role: "admin" | "organizer" | "team" | null;
    account: {
        name: string;
        email: string;
        identifier: string;
        image: string | null;
    };
};

export function DashboardSidebar({ area, children, role, account }: DashboardSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const config = {
        participant: {
            label: "Team",
            title: "Team dashboard",
            links: participantDashboardLinks,
        },
        management: {
            label: "Management panel",
            title: "Management panel",
            links: managementDashboardLinks,
        },
        admin: {
            label: "Administrator panel",
            title: "Administrator dashboard",
            links: adminDashboardLinks,
        },
    } as const;

    const { label: sidebarLabel, title: headerTitle, links } = config[area];
    const adminActive = isActivePath(pathname, "/admin");

    return (
        <SidebarProvider className="min-h-screen flex-1">
            <DashboardSidebarRouteReset />
            <Sidebar collapsible="icon" className="border-sidebar-border">
                <SidebarHeader>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-md px-2 py-2 font-bold text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    >
                        <span className="flex size-7 items-center justify-center rounded-lg bg-orange-600 text-xs text-white">
                            K
                        </span>
                        <span className="group-data-[collapsible=icon]:hidden">KBU Hackathon 2026</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{sidebarLabel}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {links.map(({ href, label, icon: Icon }) => {
                                    const active = isActivePath(pathname, href);
                                    return (
                                        <SidebarMenuItem key={href}>
                                            <SidebarMenuButton
                                                render={<Link href={href} aria-current={active ? "page" : undefined} />}
                                                tooltip={label}
                                                isActive={active}
                                            >
                                                <Icon />
                                                <span>{label}</span>
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
                                            tooltip="Admin Panel"
                                            isActive={adminActive}
                                        >
                                            <ShieldCheck />
                                            <span>Admin Panel</span>
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
                        onSignOut={async () => {
                            await authClient.signOut();
                            clearSessionHint();
                            router.push("/");
                        }}
                    />
                </SidebarFooter>
            </Sidebar>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 items-center gap-3 border-b border-orange-100 bg-white px-4">
                    <SidebarTrigger className="size-11 md:size-8" />
                    <p className="text-sm font-semibold text-zinc-700">{headerTitle}</p>
                </header>
                {children}
            </div>
        </SidebarProvider>
    );
}

function AccountFooter({
    account,
    onSignOut,
}: {
    account: DashboardSidebarProps["account"];
    onSignOut: () => Promise<void>;
}) {
    const initials = account.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const avatar = account.image ? (
        <Image src={account.image} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
    ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-900">
            {initials || "?"}
        </span>
    );

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center"
                        aria-label={`Open account menu for ${account.name}`}
                    />
                }
            >
                {avatar}
                <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-semibold text-sidebar-foreground">{account.name}</span>
                    <span className="block truncate text-xs text-sidebar-foreground/60">{account.identifier}</span>
                </span>
            </PopoverTrigger>
            <PopoverContent side="right" align="end" className="w-64">
                <PopoverHeader>
                    <div className="flex items-center gap-3">
                        {avatar}
                        <div className="min-w-0">
                            <PopoverTitle className="truncate">{account.name}</PopoverTitle>
                            <PopoverDescription className="truncate">
                                {account.image ?? "No profile image"}
                            </PopoverDescription>
                        </div>
                    </div>
                </PopoverHeader>
                <ConfirmActionAlertDialog
                    trigger={
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <LogOut className="size-4" />
                            <span>Sign out</span>
                        </button>
                    }
                    title="Sign out?"
                    description="You will need to sign in again to access this workspace."
                    confirmLabel="Sign out"
                    pendingLabel="Signing out..."
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
