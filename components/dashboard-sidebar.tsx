"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
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
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { adminDashboardLinks, managementDashboardLinks, participantDashboardLinks } from "@/lib/navigation";

type DashboardSidebarProps = {
    area: "participant" | "management" | "admin";
    children: ReactNode;
    role: "admin" | "organizer" | "team" | null;
};

export function DashboardSidebar({ area, children, role }: DashboardSidebarProps) {
    const router = useRouter();

    const config = {
        participant: {
            label: "Team workspace",
            title: "Team dashboard",
            links: participantDashboardLinks,
        },
        management: {
            label: "Management workspace",
            title: "Management panel",
            links: managementDashboardLinks,
        },
        admin: {
            label: "Administrator workspace",
            title: "Administrator dashboard",
            links: adminDashboardLinks,
        },
    } as const;

    const { label: sidebarLabel, title: headerTitle, links } = config[area];

    return (
        <SidebarProvider className="min-h-screen flex-1">
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-md px-2 py-2 font-bold text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    >
                        <span className="flex size-7 items-center justify-center rounded-lg bg-orange-600 text-xs text-white">
                            K
                        </span>
                        <span className="group-data-[collapsible=icon]:hidden">KBU Hub</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{sidebarLabel}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {links.map(({ href, label, icon: Icon }) => (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton render={<Link href={href} />} tooltip={label}>
                                            <Icon />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                {/* Only shown when the user is in the management area and has the admin role */}
                                {area === "management" && role === "admin" && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton render={<Link href="/admin" />} tooltip="Admin Panel">
                                            <span>Admin Panel</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Sign out"
                                onClick={() => {
                                    authClient.signOut({
                                        fetchOptions: {
                                            onSuccess: () => {
                                                router.push("/");
                                            },
                                        },
                                    });
                                }}
                            >
                                <LogOut />
                                <span>Sign out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 items-center gap-3 border-b border-orange-100 bg-white px-4">
                    <SidebarTrigger />
                    <p className="text-sm font-semibold text-zinc-700">{headerTitle}</p>
                </header>
                {children}
            </div>
        </SidebarProvider>
    );
}
